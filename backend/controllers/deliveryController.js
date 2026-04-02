import supabase from '../supabaseClient.js'

const DELIVERY_STATUS = {
    awaiting: 'awaiting_courier',
    assigned: 'courier_assigned',
    pickedUp: 'picked_up',
    onTheWay: 'on_the_way',
    delivered: 'delivered',
}

const EARNINGS_PER_DELIVERY = 2.5

const toRad = (value) => (value * Math.PI) / 180

const haversineDistanceKm = (lat1, lon1, lat2, lon2) => {
    const R = 6371
    const dLat = toRad(lat2 - lat1)
    const dLon = toRad(lon2 - lon1)

    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2)

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    return R * c
}

const estimateEtaMinutes = (distanceKm) => {
    const averageSpeedKmh = 25
    const prepMinutes = 4
    return Math.max(3, Math.round(prepMinutes + (distanceKm / averageSpeedKmh) * 60))
}

const safeNum = (v) => {
    const n = Number(v)
    return Number.isFinite(n) ? n : null
}

const buildFallbackDropoffFromShop = (pickupLat, pickupLng) => ({
    lat: Number((pickupLat + 0.01).toFixed(6)),
    lng: Number((pickupLng + 0.01).toFixed(6)),
})

const buildDeliveryAddress = ({ address, postalCode, city }) => [address, postalCode, city].filter(Boolean).join(', ')

const geocodeAddress = async (rawAddress) => {
    const apiKey = process.env.GOOGLE_MAPS_API_KEY || process.env.VITE_GOOGLE_MAPS_API_KEY
    const normalizedAddress = String(rawAddress || '').trim()

    if (!apiKey || !normalizedAddress) return null

    try {
        const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(normalizedAddress)}&region=fr&language=fr&key=${apiKey}`
        const response = await fetch(url)

        if (!response.ok) return null

        const payload = await response.json()
        const location = payload?.results?.[0]?.geometry?.location

        if (payload?.status !== 'OK' || !location) return null

        return {
            lat: Number(Number(location.lat).toFixed(6)),
            lng: Number(Number(location.lng).toFixed(6)),
        }
    } catch {
        return null
    }
}

const normalizeCourierName = (value) => {
    if (typeof value !== 'string') return null
    const trimmed = value.trim()
    return trimmed.length >= 2 ? trimmed : null
}

const isEstimatedDropoffFromPickup = (pickupLat, pickupLng, dropoffLat, dropoffLng) => {
    const expectedLat = Number((pickupLat + 0.01).toFixed(6))
    const expectedLng = Number((pickupLng + 0.01).toFixed(6))
    const epsilon = 0.000001

    return Math.abs(dropoffLat - expectedLat) <= epsilon && Math.abs(dropoffLng - expectedLng) <= epsilon
}

const getCourierProfile = async (courierId) => {
    if (!courierId) return { data: null, error: null }

    return supabase
        .from('delivery_persons')
        .select('id, user_id, is_available')
        .eq('user_id', courierId)
        .maybeSingle()
}

const ensureCourierProfile = async (courierId, defaultAvailability = true) => {
    const { data: existingProfile, error: existingProfileError } = await getCourierProfile(courierId)

    if (existingProfileError) {
        return { data: null, error: existingProfileError }
    }

    if (existingProfile) {
        return { data: existingProfile, error: null }
    }

    const { data: createdProfile, error: createProfileError } = await supabase
        .from('delivery_persons')
        .insert([{ user_id: courierId, is_available: defaultAvailability }])
        .select('id, user_id, is_available')
        .single()

    return { data: createdProfile || null, error: createProfileError || null }
}

export const assignCourierToOrder = async (req, res) => {
    try {
        const { orderId } = req.params

        if (!orderId) {
            return res.status(400).json({ error: 'orderId requis' })
        }

        const { data: existingMission, error: existingMissionError } = await supabase
            .from('delivery_missions')
            .select('*')
            .eq('order_id', orderId)
            .maybeSingle()

        if (existingMissionError) {
            return res.status(500).json({
                error: 'Impossible de vérifier la mission existante.',
                details: existingMissionError.message || null,
            })
        }

        if (existingMission) {
            return res.status(200).json({ success: true, mission: existingMission, alreadyAssigned: true })
        }

        const { data: order, error: orderError } = await supabase
            .from('orders')
            .select('id, shop_id, delivery_address, delivery_city, delivery_postal_code')
            .eq('id', orderId)
            .maybeSingle()

        if (orderError || !order?.id) {
            return res.status(404).json({ error: 'Commande introuvable.' })
        }

        const { data: shop, error: shopError } = await supabase
            .from('shops')
            .select('id, latitude, longitude')
            .eq('id', order.shop_id)
            .maybeSingle()

        if (shopError || !shop?.id) {
            return res.status(400).json({ error: 'Boutique introuvable pour cette commande.' })
        }

        const pickupLat = safeNum(shop.latitude)
        const pickupLng = safeNum(shop.longitude)

        if (pickupLat == null || pickupLng == null) {
            return res.status(400).json({ error: 'La boutique ne possède pas de coordonnées GPS.' })
        }

        // MVP: point de livraison client simulé autour de la boutique
        const fallbackDropoff = buildFallbackDropoffFromShop(pickupLat, pickupLng)
        const geocodedDropoff = await geocodeAddress(
            buildDeliveryAddress({
                address: order.delivery_address,
                postalCode: order.delivery_postal_code,
                city: order.delivery_city,
            })
        )
        const dropoff = geocodedDropoff || fallbackDropoff

        if (!geocodedDropoff) {
            console.warn('[delivery] geocoding client impossible, fallback coord estimée utilisée:', {
                orderId,
                deliveryAddress: buildDeliveryAddress({
                    address: order.delivery_address,
                    postalCode: order.delivery_postal_code,
                    city: order.delivery_city,
                }),
                fallbackDropoffLat: fallbackDropoff.lat,
                fallbackDropoffLng: fallbackDropoff.lng,
            })
        }

        const missionPayload = {
            order_id: orderId,
            courier_name: null,
            status: DELIVERY_STATUS.awaiting,
            pickup_lat: pickupLat,
            pickup_lng: pickupLng,
            dropoff_lat: dropoff.lat,
            dropoff_lng: dropoff.lng,
            courier_lat: pickupLat,
            courier_lng: pickupLng,
        }

        const { data: mission, error: missionError } = await supabase
            .from('delivery_missions')
            .insert([missionPayload])
            .select('*')
            .single()

        if (missionError) {
            return res.status(500).json({
                error: 'Impossible de créer la mission coursier.',
                details: missionError.message || null,
                hint: 'Vérifiez que la table delivery_missions existe avec les colonnes attendues.',
            })
        }

        return res.status(201).json({ success: true, mission })
    } catch (error) {
        console.error('assignCourierToOrder error:', error)
        return res.status(500).json({ error: 'Une erreur serveur est survenue.' })
    }
}

export const getAvailableMissions = async (_req, res) => {
    try {
        const { data, error } = await supabase
            .from('delivery_missions')
            .select(`
                id,
                order_id,
                status,
                pickup_lat,
                pickup_lng,
                dropoff_lat,
                dropoff_lng,
                created_at,
                orders:order_id (
                    id,
                    customer_name,
                    delivery_address,
                    delivery_city,
                    delivery_postal_code,
                    total_amount,
                    shop:shop_id (
                        id,
                        name,
                        address,
                        city,
                        postal_code
                    )
                )
            `)
            .eq('status', DELIVERY_STATUS.awaiting)
            .order('created_at', { ascending: true })

        if (error) {
            return res.status(500).json({ error: 'Impossible de récupérer les missions disponibles.', details: error.message })
        }

        return res.status(200).json({ success: true, missions: data || [] })
    } catch (error) {
        console.error('getAvailableMissions error:', error)
        return res.status(500).json({ error: 'Une erreur serveur est survenue.' })
    }
}

export const acceptMission = async (req, res) => {
    try {
        const { orderId } = req.params
        const courierName = normalizeCourierName(req.body?.courierName)
        const deliveryPersonId = req.body?.deliveryPersonId

        if (!courierName) {
            return res.status(400).json({ error: 'Nom du coursier requis (min 2 caractères).' })
        }

        if (!deliveryPersonId) {
            return res.status(400).json({ error: 'deliveryPersonId requis (vous devez être authentifié).' })
        }

        const { data: courierProfile, error: courierProfileError } = await ensureCourierProfile(deliveryPersonId, true)

        if (courierProfileError) {
            return res.status(500).json({ error: 'Impossible de vérifier le profil coursier.', details: courierProfileError.message })
        }

        if (!courierProfile) {
            return res.status(500).json({ error: 'Impossible d’initialiser le profil coursier.' })
        }

        if (courierProfile.is_available === false) {
            return res.status(409).json({ error: 'Coursier hors ligne. Passe en ligne avant d’accepter une mission.' })
        }

        const { data: existingActiveMission, error: existingActiveMissionError } = await supabase
            .from('delivery_missions')
            .select('id, order_id, status')
            .eq('delivery_person_id', deliveryPersonId)
            .neq('status', DELIVERY_STATUS.delivered)
            .maybeSingle()

        if (existingActiveMissionError) {
            return res.status(500).json({ error: 'Impossible de vérifier les missions en cours.', details: existingActiveMissionError.message })
        }

        if (existingActiveMission) {
            return res.status(409).json({
                error: 'Coursier déjà en mission. Termine la livraison en cours avant d’en accepter une autre.',
                currentOrderId: existingActiveMission.order_id,
                currentStatus: existingActiveMission.status,
            })
        }

        const { data: mission, error: missionError } = await supabase
            .from('delivery_missions')
            .select('*')
            .eq('order_id', orderId)
            .maybeSingle()

        if (missionError) {
            return res.status(500).json({ error: 'Impossible de récupérer la mission.', details: missionError.message })
        }

        if (!mission) {
            return res.status(404).json({ error: 'Mission introuvable pour cette commande.' })
        }

        if (mission.status !== DELIVERY_STATUS.awaiting) {
            return res.status(409).json({
                error: 'Mission déjà prise ou non disponible.',
                currentStatus: mission.status,
                currentCourier: mission.courier_name || null,
            })
        }

        const { data: updatedMission, error: updateError } = await supabase
            .from('delivery_missions')
            .update({
                courier_name: courierName,
                delivery_person_id: deliveryPersonId,
                status: DELIVERY_STATUS.assigned,
            })
            .eq('order_id', orderId)
            .eq('status', DELIVERY_STATUS.awaiting)
            .select(`
                *,
                orders:order_id (
                    id,
                    customer_name,
                    delivery_address,
                    delivery_city,
                    delivery_postal_code,
                    total_amount,
                    shop:shop_id (
                        id,
                        name,
                        address,
                        city,
                        postal_code
                    )
                )
            `)
            .single()

        if (updateError) {
            return res.status(500).json({ error: 'Impossible d’accepter la mission.', details: updateError.message })
        }

        return res.status(200).json({ success: true, mission: updatedMission })
    } catch (error) {
        console.error('acceptMission error:', error)
        return res.status(500).json({ error: 'Une erreur serveur est survenue.' })
    }
}

export const getCourierMissions = async (req, res) => {
    try {
        const { courierId } = req.params

        if (!courierId) {
            return res.status(400).json({ error: 'courierId requis.' })
        }

        const { data, error } = await supabase
            .from('delivery_missions')
            .select(`
                *,
                orders:order_id (
                    id,
                    customer_name,
                    delivery_address,
                    delivery_city,
                    delivery_postal_code,
                    total_amount,
                    shop:shop_id (
                        id,
                        name,
                        address,
                        city,
                        postal_code
                    )
                )
            `)
            .eq('delivery_person_id', courierId)
            .order('updated_at', { ascending: false })

        if (error) {
            return res.status(500).json({ error: 'Impossible de récupérer les missions du coursier.', details: error.message })
        }

        return res.status(200).json({ success: true, missions: data || [] })
    } catch (error) {
        console.error('getCourierMissions error:', error)
        return res.status(500).json({ error: 'Une erreur serveur est survenue.' })
    }
}

export const getCourierStats = async (req, res) => {
    try {
        const { courierId } = req.params

        if (!courierId) {
            return res.status(400).json({ error: 'courierId requis.' })
        }

        const { data: courierProfile, error: profileError } = await ensureCourierProfile(courierId, false)

        if (profileError) {
            return res.status(500).json({ error: 'Impossible de récupérer le profil coursier.', details: profileError.message })
        }

        const { count: deliveredCount, error: deliveredError } = await supabase
            .from('delivery_missions')
            .select('id', { count: 'exact', head: true })
            .eq('delivery_person_id', courierId)
            .eq('status', DELIVERY_STATUS.delivered)

        if (deliveredError) {
            return res.status(500).json({ error: 'Impossible de compter les livraisons.', details: deliveredError.message })
        }

        const totalDeliveries = deliveredCount || 0
        const totalEarnings = Number((totalDeliveries * EARNINGS_PER_DELIVERY).toFixed(2))

        // Garder la table delivery_persons cohérente pour les vues existantes
        await supabase
            .from('delivery_persons')
            .update({ total_deliveries: totalDeliveries })
            .eq('user_id', courierId)

        return res.status(200).json({
            success: true,
            stats: {
                totalDeliveries,
                totalEarnings,
                rating: Number(courierProfile?.rating || 5),
                isAvailable: Boolean(courierProfile?.is_available),
            },
        })
    } catch (error) {
        console.error('getCourierStats error:', error)
        return res.status(500).json({ error: 'Une erreur serveur est survenue.' })
    }
}

export const updateCourierAvailability = async (req, res) => {
    try {
        const { courierId } = req.params
        const isAvailable = Boolean(req.body?.isAvailable)

        if (!courierId) {
            return res.status(400).json({ error: 'courierId requis.' })
        }

        const { data: courierProfile, error: courierProfileError } = await ensureCourierProfile(courierId, isAvailable)

        if (courierProfileError) {
            return res.status(500).json({ error: 'Impossible de récupérer le profil coursier.', details: courierProfileError.message })
        }

        if (!courierProfile) {
            return res.status(500).json({ error: 'Impossible d’initialiser le profil coursier.' })
        }

        const { data: updatedCourier, error: updateError } = await supabase
            .from('delivery_persons')
            .update({ is_available: isAvailable })
            .eq('user_id', courierId)
            .select('id, user_id, is_available, updated_at')
            .single()

        if (updateError) {
            return res.status(500).json({ error: 'Impossible de mettre à jour la disponibilité du coursier.', details: updateError.message })
        }

        return res.status(200).json({ success: true, courier: updatedCourier })
    } catch (error) {
        console.error('updateCourierAvailability error:', error)
        return res.status(500).json({ error: 'Une erreur serveur est survenue.' })
    }
}

export const getDeliveryTracking = async (req, res) => {
    try {
        const { orderId } = req.params

        const { data: mission, error } = await supabase
            .from('delivery_missions')
            .select('*')
            .eq('order_id', orderId)
            .maybeSingle()

        if (error) {
            return res.status(500).json({ error: 'Impossible de récupérer le tracking.', details: error.message })
        }

        if (!mission) {
            return res.status(404).json({ error: 'Aucune mission coursier trouvée pour cette commande.' })
        }

        // Récupérer l'adresse réelle de livraison depuis la table orders
        const { data: order, error: orderError } = await supabase
            .from('orders')
            .select('delivery_address, delivery_city, delivery_postal_code, customer_name')
            .eq('id', orderId)
            .maybeSingle()

        const courierLat = safeNum(mission.courier_lat)
        const courierLng = safeNum(mission.courier_lng)
        const pickupLat = safeNum(mission.pickup_lat)
        const pickupLng = safeNum(mission.pickup_lng)
        const dropoffLat = safeNum(mission.dropoff_lat)
        const dropoffLng = safeNum(mission.dropoff_lng)

        const etaMinutes =
            courierLat != null && courierLng != null && dropoffLat != null && dropoffLng != null
                ? estimateEtaMinutes(haversineDistanceKm(courierLat, courierLng, dropoffLat, dropoffLng))
                : null

        return res.status(200).json({
            success: true,
            tracking: {
                ...mission,
                eta_minutes: mission.status === DELIVERY_STATUS.delivered ? 0 : etaMinutes,
                dropoff_source:
                    pickupLat != null &&
                        pickupLng != null &&
                        dropoffLat != null &&
                        dropoffLng != null &&
                        isEstimatedDropoffFromPickup(pickupLat, pickupLng, dropoffLat, dropoffLng)
                        ? 'estimated_from_shop'
                        : 'geocoded_or_real',
                delivery_address: order?.delivery_address || null,
                delivery_city: order?.delivery_city || null,
                delivery_postal_code: order?.delivery_postal_code || null,
                customer_name: order?.customer_name || null,
            },
        })
    } catch (error) {
        console.error('getDeliveryTracking error:', error)
        return res.status(500).json({ error: 'Une erreur serveur est survenue.' })
    }
}

export const updateDeliveryStatus = async (req, res) => {
    try {
        const { orderId } = req.params
        const { status } = req.body || {}

        const validStatuses = Object.values(DELIVERY_STATUS)

        if (!validStatuses.includes(status)) {
            return res.status(400).json({ error: `Statut invalide. Valeurs autorisées: ${validStatuses.join(', ')}` })
        }

        // Récupérer la mission AVANT de l'updater pour avoir delivery_person_id et order.total_amount
        const { data: missionBefore, error: beforeError } = await supabase
            .from('delivery_missions')
            .select(`
                *,
                orders:order_id (
                    id,
                    total_amount
                )
            `)
            .eq('order_id', orderId)
            .maybeSingle()

        if (beforeError) {
            return res.status(500).json({ error: 'Impossible de récupérer la mission.', details: beforeError.message })
        }

        if (!missionBefore) {
            return res.status(404).json({ error: 'Mission non trouvée.' })
        }

        // Mettre à jour le statut
        const { data, error } = await supabase
            .from('delivery_missions')
            .update({ status })
            .eq('order_id', orderId)
            .select(`
                *,
                orders:order_id (
                    id,
                    customer_name,
                    delivery_address,
                    delivery_city,
                    delivery_postal_code,
                    total_amount,
                    shop:shop_id (
                        id,
                        name,
                        address,
                        city,
                        postal_code
                    )
                )
            `)
            .single()

        if (error) {
            return res.status(500).json({ error: 'Impossible de mettre à jour le statut.', details: error.message })
        }

        // Si statut passe à "delivered", mettre à jour les stats du coursier
        if (status === DELIVERY_STATUS.delivered && missionBefore.delivery_person_id) {
            // Récupérer les stats actuelles du coursier
            const { data: courierStats, error: statsError } = await supabase
                .from('delivery_persons')
                .select('total_deliveries')
                .eq('user_id', missionBefore.delivery_person_id)
                .maybeSingle()

            if (!statsError && courierStats) {
                const newTotalDeliveries = (courierStats.total_deliveries || 0) + 1

                // Ne pas bloquer si la mise à jour des stats échoue (log seulement)
                const { error: updateStatsError } = await supabase
                    .from('delivery_persons')
                    .update({
                        total_deliveries: newTotalDeliveries,
                    })
                    .eq('user_id', missionBefore.delivery_person_id)

                if (updateStatsError) {
                    console.error('Erreur mise à jour stats coursier:', updateStatsError)
                }
            }
        }

        return res.status(200).json({ success: true, mission: data })
    } catch (error) {
        console.error('updateDeliveryStatus error:', error)
        return res.status(500).json({ error: 'Une erreur serveur est survenue.' })
    }
}

export const simulateDeliveryStep = async (req, res) => {
    try {
        const { orderId } = req.params

        const { data: mission, error: missionError } = await supabase
            .from('delivery_missions')
            .select('*')
            .eq('order_id', orderId)
            .single()

        if (missionError || !mission) {
            return res.status(404).json({ error: 'Mission coursier introuvable.' })
        }

        let nextStatus = mission.status
        let nextLat = safeNum(mission.courier_lat)
        let nextLng = safeNum(mission.courier_lng)

        const pickupLat = safeNum(mission.pickup_lat)
        const pickupLng = safeNum(mission.pickup_lng)
        const dropoffLat = safeNum(mission.dropoff_lat)
        const dropoffLng = safeNum(mission.dropoff_lng)

        if ([pickupLat, pickupLng, dropoffLat, dropoffLng].some((v) => v == null)) {
            return res.status(400).json({ error: 'Coordonnées mission invalides pour la simulation.' })
        }

        if (mission.status === DELIVERY_STATUS.awaiting) {
            return res.status(409).json({ error: 'Mission en attente d’acceptation par un coursier.' })
        }

        if (mission.status === DELIVERY_STATUS.assigned) {
            nextStatus = DELIVERY_STATUS.pickedUp
            nextLat = pickupLat
            nextLng = pickupLng
        } else if (mission.status === DELIVERY_STATUS.pickedUp) {
            nextStatus = DELIVERY_STATUS.onTheWay
        } else if (mission.status === DELIVERY_STATUS.onTheWay) {
            const progress = 0.35
            nextLat = Number((nextLat + (dropoffLat - nextLat) * progress).toFixed(6))
            nextLng = Number((nextLng + (dropoffLng - nextLng) * progress).toFixed(6))

            const remainingKm = haversineDistanceKm(nextLat, nextLng, dropoffLat, dropoffLng)
            if (remainingKm <= 0.15) {
                nextStatus = DELIVERY_STATUS.delivered
                nextLat = dropoffLat
                nextLng = dropoffLng
            }
        }

        const { data: updatedMission, error: updateError } = await supabase
            .from('delivery_missions')
            .update({
                status: nextStatus,
                courier_lat: nextLat,
                courier_lng: nextLng,
            })
            .eq('order_id', orderId)
            .select('*')
            .single()

        if (updateError) {
            return res.status(500).json({ error: 'Impossible de simuler l’avancement.', details: updateError.message })
        }

        return res.status(200).json({ success: true, mission: updatedMission })
    } catch (error) {
        console.error('simulateDeliveryStep error:', error)
        return res.status(500).json({ error: 'Une erreur serveur est survenue.' })
    }
}

export const recalculateCourierStats = async (req, res) => {
    try {
        const { email } = req.params

        if (!email) {
            return res.status(400).json({ error: 'Email du coursier requis' })
        }

        // 1. Récupérer le user_id depuis auth.users via l'email
        const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers()
        const user = authUsers?.users?.find(u => u.email === email)

        if (!user) {
            return res.status(404).json({ error: `Utilisateur avec l'email ${email} non trouvé` })
        }

        // 2. Récupérer le profil du coursier
        const { data: courierProfile, error: profileError } = await supabase
            .from('delivery_persons')
            .select('id')
            .eq('user_id', user.id)
            .maybeSingle()

        if (profileError || !courierProfile) {
            return res.status(404).json({ error: 'Profil coursier non trouvé' })
        }

        // 3. Compter les missions complétées (delivered)
        const { data: deliveredMissions, error: missionsError } = await supabase
            .from('delivery_missions')
            .select('id', { count: 'exact' })
            .eq('delivery_person_id', user.id)
            .eq('status', DELIVERY_STATUS.delivered)

        if (missionsError) {
            return res.status(500).json({ error: 'Erreur lors du comptage des missions' })
        }

        const totalDeliveries = deliveredMissions?.length || 0
        const totalEarnings = totalDeliveries * EARNINGS_PER_DELIVERY

        // 4. Mettre à jour les stats
        const { data: updated, error: updateError } = await supabase
            .from('delivery_persons')
            .update({
                total_deliveries: totalDeliveries,
            })
            .eq('user_id', user.id)
            .select()
            .single()

        if (updateError) {
            return res.status(500).json({ error: 'Erreur mise à jour stats', details: updateError.message })
        }

        return res.status(200).json({
            success: true,
            message: `Stats recalculées pour ${email}`,
            stats: {
                totalDeliveries,
                totalEarnings: totalEarnings.toFixed(2),
                updated
            }
        })
    } catch (error) {
        console.error('recalculateCourierStats error:', error)
        return res.status(500).json({ error: 'Une erreur serveur est survenue.' })
    }
}

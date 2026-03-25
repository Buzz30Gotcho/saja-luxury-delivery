import supabase from '../supabaseClient.js'

const DELIVERY_STATUS = {
    assigned: 'courier_assigned',
    pickedUp: 'picked_up',
    onTheWay: 'on_the_way',
    delivered: 'delivered',
}

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

const randomCourierName = () => {
    const names = ['Nina', 'Sofiane', 'Emma', 'Yanis', 'Chloé', 'Lucas']
    return names[Math.floor(Math.random() * names.length)]
}

const buildFallbackDropoffFromShop = (pickupLat, pickupLng) => ({
    lat: Number((pickupLat + 0.01).toFixed(6)),
    lng: Number((pickupLng + 0.01).toFixed(6)),
})

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
            .select('id, shop_id')
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

        const missionPayload = {
            order_id: orderId,
            courier_name: randomCourierName(),
            status: DELIVERY_STATUS.assigned,
            pickup_lat: pickupLat,
            pickup_lng: pickupLng,
            dropoff_lat: fallbackDropoff.lat,
            dropoff_lng: fallbackDropoff.lng,
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

        const courierLat = safeNum(mission.courier_lat)
        const courierLng = safeNum(mission.courier_lng)
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

        const { data, error } = await supabase
            .from('delivery_missions')
            .update({ status })
            .eq('order_id', orderId)
            .select('*')
            .single()

        if (error) {
            return res.status(500).json({ error: 'Impossible de mettre à jour le statut.', details: error.message })
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

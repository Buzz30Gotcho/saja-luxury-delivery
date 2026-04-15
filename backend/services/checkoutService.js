import supabase from '../supabaseClient.js'
import { createHttpError } from '../utils/httpError.js'

const buildDeliveryAddress = ({ address, postalCode, city, country }) =>
    [address, postalCode, city, country].filter(Boolean).join(', ')

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

export async function processPaymentService({ paymentDetails, shippingDetails, userId, cartItems, totalPrice }) {
    if (!userId) {
        throw createHttpError(401, 'Utilisateur non authentifié. Veuillez vous reconnecter pour finaliser la commande.')
    }

    if (!paymentDetails?.cardHolder || paymentDetails.cardHolder.trim().length < 3) {
        throw createHttpError(400, 'Titulaire de la carte invalide.')
    }

    const cardNumber = String(paymentDetails.cardNumber || '').replace(/\s/g, '')
    if (!/^\d{16}$/.test(cardNumber)) {
        throw createHttpError(400, 'Numéro de carte invalide (16 chiffres requis).')
    }

    if (!/^\d{2}\/\d{2}$/.test(String(paymentDetails.expiry || ''))) {
        throw createHttpError(400, "Date d'expiration invalide (format attendu : MM/AA).")
    }

    const [month, year] = paymentDetails.expiry.split('/').map(Number)

    if (month < 1 || month > 12) {
        throw createHttpError(400, 'Le mois doit être compris entre 01 et 12.')
    }

    const now = new Date()
    const currentYear = now.getFullYear() % 100
    const currentMonth = now.getMonth() + 1

    if (year < currentYear || (year === currentYear && month < currentMonth)) {
        throw createHttpError(400, 'Cette carte est expirée.')
    }

    if (!/^\d{3,4}$/.test(String(paymentDetails.cvc || ''))) {
        throw createHttpError(400, 'CVC invalide (3 ou 4 chiffres).')
    }

    if (
        !shippingDetails?.fullName ||
        !shippingDetails?.address ||
        !shippingDetails?.city ||
        !shippingDetails?.postalCode ||
        !shippingDetails?.country
    ) {
        throw createHttpError(400, 'Les informations de livraison sont incomplètes.')
    }

    if (cardNumber.endsWith('0000')) {
        throw createHttpError(402, 'Paiement refusé (simulation). Essayez une autre carte de test.', {
            transactionId: null,
        })
    }

    const transactionId = `SIM-${Date.now().toString().slice(-8)}`

    const normalizedItems = Array.isArray(cartItems)
        ? cartItems.map((item) => ({
            id: item.id,
            quantity: item.quantity,
            product_id: item.products?.id ?? item.product_id ?? null,
            name: item.products?.name ?? null,
            unit_price: Number(item.products?.price ?? item.unit_price ?? 0),
            shop_id: item.products?.shop_id ?? item.shop_id ?? null,
        }))
        : []

    let shopId = normalizedItems.find((item) => item.shop_id)?.shop_id

    if (!shopId) {
        const firstProductId = normalizedItems.find((item) => item.product_id)?.product_id
        if (firstProductId) {
            const { data: productRow, error: productLookupError } = await supabase
                .from('products')
                .select('shop_id')
                .eq('id', firstProductId)
                .maybeSingle()

            if (!productLookupError) {
                shopId = productRow?.shop_id || null
            }
        }
    }

    if (!shopId) {
        throw createHttpError(400, 'Impossible de déterminer la boutique de la commande (shop_id manquant).')
    }

    const orderData = {
        user_id: userId,
        customer_name: shippingDetails.fullName,
        customer_email: shippingDetails.email || paymentDetails.email || 'no-email@shopinline.local',
        customer_phone: shippingDetails.phone || null,
        delivery_address: shippingDetails.address,
        delivery_city: shippingDetails.city,
        delivery_postal_code: shippingDetails.postalCode,
        delivery_instructions: shippingDetails.instructions || null,
        total_amount: Number(totalPrice) || 0,
        delivery_fee: Number(shippingDetails.deliveryFee || 0),
        shop_id: shopId,
        payment_method: 'card',
        payment_status: 'paid',
    }

    const { data: createdOrder, error: insertOrderError } = await supabase
        .from('orders')
        .insert([orderData])
        .select('id, created_at')
        .single()

    if (insertOrderError || !createdOrder?.id) {
        throw createHttpError(500, 'Paiement validé, mais impossible d’enregistrer la commande.', {
            details: insertOrderError?.message || null,
            hint: insertOrderError?.hint || null,
            code: insertOrderError?.code || null,
        })
    }

    const orderItemsData = normalizedItems
        .filter((item) => item.product_id)
        .map((item) => ({
            order_id: createdOrder.id,
            product_id: item.product_id,
            quantity: Number(item.quantity) || 1,
            unit_price: Number(item.unit_price) || 0,
        }))

    if (orderItemsData.length > 0) {
        const { error: insertItemsError } = await supabase.from('order_items').insert(orderItemsData)

        if (insertItemsError) {
            await supabase.from('orders').delete().eq('id', createdOrder.id)
            throw createHttpError(500, 'Paiement validé, mais impossible d’enregistrer les articles de commande.', {
                details: insertItemsError.message || null,
                hint: insertItemsError.hint || null,
                code: insertItemsError.code || null,
            })
        }
    }

    const { data: shopForMission } = await supabase
        .from('shops')
        .select('latitude, longitude')
        .eq('id', shopId)
        .maybeSingle()

    const pickupLat = Number(shopForMission?.latitude)
    const pickupLng = Number(shopForMission?.longitude)
    const hasPickupCoords = Number.isFinite(pickupLat) && Number.isFinite(pickupLng)

    if (hasPickupCoords) {
        const deliveryAddress = buildDeliveryAddress({
            address: shippingDetails.address,
            postalCode: shippingDetails.postalCode,
            city: shippingDetails.city,
            country: shippingDetails.country,
        })

        const geocodedDropoff = await geocodeAddress(deliveryAddress)
        const fallbackDropoffLat = Number((pickupLat + 0.01).toFixed(6))
        const fallbackDropoffLng = Number((pickupLng + 0.01).toFixed(6))

        await supabase
            .from('delivery_missions')
            .insert([
                {
                    order_id: createdOrder.id,
                    courier_name: null,
                    status: 'awaiting_courier',
                    pickup_lat: pickupLat,
                    pickup_lng: pickupLng,
                    dropoff_lat: geocodedDropoff?.lat ?? fallbackDropoffLat,
                    dropoff_lng: geocodedDropoff?.lng ?? fallbackDropoffLng,
                    courier_lat: pickupLat,
                    courier_lng: pickupLng,
                },
            ])
    }

    return {
        success: true,
        message: 'Paiement traité avec succès.',
        transactionId,
        orderId: createdOrder.id,
    }
}

export async function getUserOrdersService(userId) {
    if (!userId) throw createHttpError(400, 'userId requis')

    const { data, error } = await supabase
        .from('orders')
        .select(`
                *,
                order_items (
                    id,
                    product_id,
                    quantity,
                    unit_price,
                    total_price,
                    products:product_id (
                        id,
                        name,
                        image,
                        price
                    )
                )
            `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

    if (error) throw createHttpError(500, 'Une erreur serveur est survenue.', error.message)

    const normalizedOrders = (data || []).map((order) => ({
        id: order.id,
        order_number: String(order.id).slice(0, 8).toUpperCase(),
        transaction_id: `SIM-${String(order.id).replace(/-/g, '').slice(0, 8).toUpperCase()}`,
        total_price: Number(order.total_amount || 0),
        status: order.payment_status === 'paid' ? 'confirmed' : order.status || 'pending',
        shipping_details: {
            fullName: order.customer_name,
            address: order.delivery_address,
            city: order.delivery_city,
            postalCode: order.delivery_postal_code,
            phone: order.customer_phone,
        },
        items: Array.isArray(order.order_items)
            ? order.order_items.map((item) => ({
                ...item,
                product_name: item?.products?.name || 'Produit',
                product_image: item?.products?.image || null,
            }))
            : [],
        created_at: order.created_at,
    }))

    return {
        success: true,
        orders: normalizedOrders,
    }
}

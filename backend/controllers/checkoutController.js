import supabase from '../supabaseClient.js'

export const processPayment = async (req, res) => {
    try {
        const { paymentDetails, shippingDetails, userId, cartItems, totalPrice } = req.body;

        if (!userId) {
            return res.status(401).json({
                error: 'Utilisateur non authentifié. Veuillez vous reconnecter pour finaliser la commande.'
            });
        }

        // Validation du titulaire
        if (!paymentDetails.cardHolder || paymentDetails.cardHolder.trim().length < 3) {
            return res.status(400).json({ error: 'Titulaire de la carte invalide.' });
        }

        // Validation du numéro de carte (format 16 chiffres)
        const cardNumber = paymentDetails.cardNumber.replace(/\s/g, '');
        if (!/^\d{16}$/.test(cardNumber)) {
            return res.status(400).json({ error: 'Numéro de carte invalide (16 chiffres requis).' });
        }

        // Validation de l'expiration
        if (!/^\d{2}\/\d{2}$/.test(paymentDetails.expiry)) {
            return res.status(400).json({ error: 'Date d\'expiration invalide (format attendu : MM/AA).' });
        }

        const [month, year] = paymentDetails.expiry.split('/').map(Number);

        if (month < 1 || month > 12) {
            return res.status(400).json({ error: 'Le mois doit être compris entre 01 et 12.' });
        }

        // Vérifier si la carte n'est pas expirée
        const now = new Date();
        const currentYear = now.getFullYear() % 100;
        const currentMonth = now.getMonth() + 1;

        if (year < currentYear || (year === currentYear && month < currentMonth)) {
            return res.status(400).json({ error: 'Cette carte est expirée.' });
        }

        // Validation du CVC
        if (!/^\d{3,4}$/.test(paymentDetails.cvc)) {
            return res.status(400).json({ error: 'CVC invalide (3 ou 4 chiffres).' });
        }

        // Validation de l'adresse
        if (
            !shippingDetails.fullName ||
            !shippingDetails.address ||
            !shippingDetails.city ||
            !shippingDetails.postalCode ||
            !shippingDetails.country
        ) {
            return res.status(400).json({ error: 'Les informations de livraison sont incomplètes.' });
        }

        // SIMULATION: Cartes de test
        // Carte finissant par 0000 -> refus
        // Toute autre carte -> succès
        if (cardNumber.endsWith('0000')) {
            return res.status(402).json({
                error: 'Paiement refusé (simulation). Essayez une autre carte de test.',
                transactionId: null,
            });
        }

        // Succès de la simulation du paiement
        const transactionId = `SIM-${Date.now().toString().slice(-8)}`;

        const normalizedItems = Array.isArray(cartItems)
            ? cartItems.map((item) => ({
                id: item.id,
                quantity: item.quantity,
                product_id: item.products?.id ?? item.product_id ?? null,
                name: item.products?.name ?? null,
                unit_price: Number(item.products?.price ?? item.unit_price ?? 0),
                shop_id: item.products?.shop_id ?? item.shop_id ?? null,
            }))
            : [];

        let shopId = normalizedItems.find((item) => item.shop_id)?.shop_id;

        if (!shopId) {
            const firstProductId = normalizedItems.find((item) => item.product_id)?.product_id;
            if (firstProductId) {
                const { data: productRow, error: productLookupError } = await supabase
                    .from('products')
                    .select('shop_id')
                    .eq('id', firstProductId)
                    .maybeSingle();

                if (productLookupError) {
                    console.error('Error resolving shop_id from product:', productLookupError);
                } else {
                    shopId = productRow?.shop_id || null;
                }
            }
        }

        if (!shopId) {
            return res.status(400).json({
                error: 'Impossible de déterminer la boutique de la commande (shop_id manquant).'
            });
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
        };

        const { data: createdOrder, error: insertOrderError } = await supabase
            .from('orders')
            .insert([orderData])
            .select('id, created_at')
            .single();

        if (insertOrderError || !createdOrder?.id) {
            console.error('Error saving order:', insertOrderError);
            return res.status(500).json({
                error: 'Paiement validé, mais impossible d’enregistrer la commande.',
                details: insertOrderError?.message || null,
                hint: insertOrderError?.hint || null,
                code: insertOrderError?.code || null,
                expectedColumns: [
                    'user_id',
                    'customer_name',
                    'customer_email',
                    'customer_phone',
                    'delivery_address',
                    'delivery_city',
                    'delivery_postal_code',
                    'delivery_instructions',
                    'total_amount',
                    'delivery_fee',
                    'shop_id',
                    'payment_method',
                    'payment_status'
                ]
            });
        }

        const orderItemsData = normalizedItems
            .filter((item) => item.product_id)
            .map((item) => ({
                order_id: createdOrder.id,
                product_id: item.product_id,
                quantity: Number(item.quantity) || 1,
                unit_price: Number(item.unit_price) || 0,
            }));

        if (orderItemsData.length > 0) {
            const { error: insertItemsError } = await supabase
                .from('order_items')
                .insert(orderItemsData);

            if (insertItemsError) {
                console.error('Error saving order items:', insertItemsError);
                await supabase.from('orders').delete().eq('id', createdOrder.id);
                return res.status(500).json({
                    error: 'Paiement validé, mais impossible d’enregistrer les articles de commande.',
                    details: insertItemsError.message || null,
                    hint: insertItemsError.hint || null,
                    code: insertItemsError.code || null,
                });
            }
        }

        return res.status(200).json({
            success: true,
            message: 'Paiement traité avec succès.',
            transactionId: transactionId,
        });
    } catch (error) {
        console.error('Payment processing error:', error);
        return res.status(500).json({ error: 'Une erreur serveur est survenue.' });
    }
};

export const getUserOrders = async (req, res) => {
    try {
        const { userId } = req.params;

        if (!userId) {
            return res.status(400).json({ error: 'userId requis' });
        }

        const { data, error } = await supabase
            .from('orders')
            .select(`
                *,
                order_items (
                    id,
                    product_id,
                    quantity,
                    unit_price,
                    total_price
                )
            `)
            .eq('user_id', userId)
            .order('created_at', { ascending: false });

        if (error) throw error;

        const normalizedOrders = (data || []).map((order) => ({
            id: order.id,
            transaction_id: `SIM-${String(order.id).replace(/-/g, '').slice(0, 8).toUpperCase()}`,
            total_price: Number(order.total_amount || 0),
            status: order.payment_status === 'paid' ? 'confirmed' : (order.status || 'pending'),
            shipping_details: {
                fullName: order.customer_name,
                address: order.delivery_address,
                city: order.delivery_city,
                postalCode: order.delivery_postal_code,
                phone: order.customer_phone,
            },
            items: Array.isArray(order.order_items) ? order.order_items : [],
            created_at: order.created_at,
        }));

        return res.status(200).json({
            success: true,
            orders: normalizedOrders,
        });
    } catch (error) {
        console.error('Error fetching orders:', error);
        return res.status(500).json({ error: 'Une erreur serveur est survenue.' });
    }
};

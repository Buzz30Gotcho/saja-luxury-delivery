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
                unit_price: item.products?.price ?? null,
            }))
            : [];

        const orderData = {
            user_id: userId,
            transaction_id: transactionId,
            total_price: Number(totalPrice) || 0,
            status: 'confirmed',
            shipping_details: shippingDetails,
            items: normalizedItems,
            created_at: new Date().toISOString(),
        };

        const { error: insertError } = await supabase
            .from('orders')
            .insert([orderData]);

        if (insertError) {
            console.error('Error saving order:', insertError);
            return res.status(500).json({
                error: 'Paiement validé, mais impossible d’enregistrer la commande. Vérifiez la table orders (colonnes user_id, transaction_id, total_price, status, shipping_details, items, created_at) et les politiques RLS.'
            });
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
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false });

        if (error) throw error;

        return res.status(200).json({
            success: true,
            orders: data || [],
        });
    } catch (error) {
        console.error('Error fetching orders:', error);
        return res.status(500).json({ error: 'Une erreur serveur est survenue.' });
    }
};

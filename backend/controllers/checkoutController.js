// Backend payment validation controller
export const processPayment = async (req, res) => {
    try {
        const { paymentDetails, shippingDetails } = req.body;

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

import Stripe from "stripe";
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export const createPaymentIntent = async (req, res) => {
    const { items, amount } = req.body;
    const calculatedamount = Math.round(amount * 100)// stripe attend le montant en centimes
    try {
        const paymentIntent = await stripe.paymentIntents.create({// intent de paiement pour le montant calculé
            amount: calculatedamount,
            currency: 'eur',
            payment_method_types: ['card'],
        });
        res.status(200).send({
            clientSecret: paymentIntent.client_secret,
        });
    } catch (error) {
        console.error('Error creating payment intent:', error);
        res.status(500).send({ error: 'Failed to create payment intent' });
    }
};

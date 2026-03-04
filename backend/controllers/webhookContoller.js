import Checkout from '../../frontend/src/pages/Checkout';

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const endpointSecret = process.env.STRIPE_ENDPOINT_SECRET;

export const handleStripeWebhook = (req, res) => {
    const sig = req.headers['stripe-signature'];
    let event;

    try {
        event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
    } catch (err) {
        console.error('Webhook signature verification failed:', err);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Handle the event
    switch (event.type) {
        case 'payment_intent.completed':
            const paiementIntentSucced = event.data.object;// le paiement a ete complete
            console.log('Le checkout a ete complete!', paiementIntentSucced);
        default:
            console.log(`Unhandled event type ${event.type}`);
    }

    res.send({ received: true });
};


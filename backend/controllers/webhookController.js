import Stripe from 'stripe';
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET; // Changed to STRIPE_WEBHOOK_SECRET for consistency

export const handleStripeWebhook = (req, res) => {
    const sig = req.headers['stripe-signature'];
    let event;

    try {
        // CRITICAL: Use req.rawBody for Stripe signature verification
        event = stripe.webhooks.constructEvent(req.rawBody, sig, endpointSecret);
    } catch (err) {
        console.error('Webhook signature verification failed:', err);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Handle the event
    switch (event.type) {
        case 'payment_intent.succeeded': // l'argent a ete preleve avec succes par stripe
            const paymentIntentSucceeded = event.data.object;
            console.log('Payment Intent Succeeded:', paymentIntentSucceeded);
            // Example: Fulfill the customer's order or update database
            break; // Added break
        case 'checkout.session.completed':// Le client est alle au bout du processus de paiement 
            const checkoutSessionCompleted = event.data.object;
            console.log('Checkout Session Completed:', checkoutSessionCompleted);
            // Example: Update order status in your database
            break;
        default:
            console.log(`Unhandled event type ${event.type}`);
    }

    res.send(); // Simplified response
};

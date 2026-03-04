import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import CartContext from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';

const Checkout = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { cart, totalPrice, clearCart } = useContext(CartContext);
  
  const [shippingDetails, setShippingDetails] = useState({
    fullName: '',
    address: '',
    city: '',
    postalCode: '',
    country: '',
  });

  const [paymentDetails, setPaymentDetails] = useState({
    cardHolder: '',
    cardNumber: '',
    expiry: '',
    cvc: '',
  });

  const [paymentError, setPaymentError] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [transactionId, setTransactionId] = useState('');

  const handleShippingChange = (e) => {
    setShippingDetails({ ...shippingDetails, [e.target.name]: e.target.value });
  };

  const handlePaymentChange = (e) => {
    let { name, value } = e.target;

    if (name === 'cardNumber' || name === 'cvc') {
      value = value.replace(/\D/g, '');
    }

    if (name === 'expiry') {
      value = value
        .replace(/[^\d]/g, '')
        .slice(0, 4)
        .replace(/(\d{2})(\d)/, '$1/$2');
    }

    setPaymentDetails((prev) => ({ ...prev, [name]: value }));
  };

  const isShippingValid =
    shippingDetails.fullName &&
    shippingDetails.address &&
    shippingDetails.city &&
    shippingDetails.postalCode &&
    shippingDetails.country;

  // Client-side basic checks (UI only, server validates everything)
  const isPaymentComplete =
    paymentDetails.cardHolder &&
    paymentDetails.cardNumber &&
    paymentDetails.expiry &&
    paymentDetails.cvc;

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    
    if (!isShippingValid || !isPaymentComplete) {
      setPaymentError('Merci de compléter les informations de livraison et de paiement.');
      return;
    }

    setIsProcessing(true);
    setPaymentError(null);

    try {
      const resolvedUserId = user?.id || user?.user?.id || user?.profile?.id || null;

      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paymentDetails,
          shippingDetails,
          userId: resolvedUserId,
          cartItems: cart,
          totalPrice,
        }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        setPaymentError(data.error || 'Une erreur est survenue.');
        setIsProcessing(false);
        return;
      }

      // Succès du paiement
      setTransactionId(data.transactionId);
      await clearCart();
      setOrderPlaced(true);
    } catch (error) {
      console.error('Payment error:', error);
      setPaymentError('Une erreur réseau ou de serveur est survenue.');
      setIsProcessing(false);
    }
  };

  if (orderPlaced) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <motion.div 
          className="max-w-md w-full text-center space-y-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-4xl font-serif text-text-dark">Merci pour votre commande</h1>
          <p className="text-[11px] uppercase tracking-[0.2em] text-text-light leading-relaxed">
            Votre demande est en cours de traitement par nos maisons partenaires. <br /> Un email de confirmation vous a été envoyé.
          </p>
          <p className="text-[10px] uppercase tracking-[0.2em] text-text-medium">
            Référence paiement : {transactionId}
          </p>
          <button 
            onClick={() => navigate('/')} 
            className="inline-block px-10 py-4 bg-text-dark text-white text-[11px] font-bold uppercase tracking-[0.2em] hover:bg-green transition-all duration-500 shadow-sm"
          >
            Retour au catalogue
          </button>
        </motion.div>
      </div>
    );
  }

  if (!cart || cart.length === 0) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <div className="max-w-md w-full text-center space-y-8">
          <h1 className="text-4xl font-serif text-text-dark">Votre panier est vide</h1>
          <p className="text-[11px] uppercase tracking-[0.2em] text-text-light">
            Ajoutez des articles avant de finaliser votre commande.
          </p>
          <button 
            onClick={() => navigate('/')} 
            className="inline-block px-10 py-4 bg-text-dark text-white text-[11px] font-bold uppercase tracking-[0.2em] hover:bg-green transition-all duration-500 shadow-sm"
          >
            Découvrir la sélection
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background pt-32 pb-24">
      <div className="container mx-auto px-6 md:px-12">
        <h1 className="text-4xl font-serif text-text-dark mb-16 text-center">Finaliser votre commande</h1>

        <div className="flex flex-col lg:flex-row gap-16">
          {/* Shipping Details */}
          <motion.div 
            className="lg:w-2/3 space-y-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="bg-card border border-border p-10 shadow-sm">
              <h2 className="text-[11px] font-bold uppercase tracking-[0.3em] text-green mb-10 pb-4 border-b border-border/50">
                1. Adresse de livraison
              </h2>
              <form className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-10">
                <div className="md:col-span-2">
                  <label className="block text-[10px] uppercase tracking-widest text-text-medium font-bold mb-2">Nom complet</label>
                  <input
                    type="text"
                    name="fullName"
                    placeholder="..."
                    value={shippingDetails.fullName}
                    onChange={handleShippingChange}
                    className="w-full py-2 bg-transparent border-b border-border text-text-dark focus:outline-none focus:border-green transition-all"
                    required
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-[10px] uppercase tracking-widest text-text-medium font-bold mb-2">Adresse (Numéro et Rue)</label>
                  <input
                    type="text"
                    name="address"
                    placeholder="..."
                    value={shippingDetails.address}
                    onChange={handleShippingChange}
                    className="w-full py-2 bg-transparent border-b border-border text-text-dark focus:outline-none focus:border-green transition-all"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-text-medium font-bold mb-2">Ville</label>
                  <input
                    type="text"
                    name="city"
                    placeholder="..."
                    value={shippingDetails.city}
                    onChange={handleShippingChange}
                    className="w-full py-2 bg-transparent border-b border-border text-text-dark focus:outline-none focus:border-green transition-all"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-text-medium font-bold mb-2">Code Postal</label>
                  <input
                    type="text"
                    name="postalCode"
                    placeholder="..."
                    value={shippingDetails.postalCode}
                    onChange={handleShippingChange}
                    className="w-full py-2 bg-transparent border-b border-border text-text-dark focus:outline-none focus:border-green transition-all"
                    required
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-[10px] uppercase tracking-widest text-text-medium font-bold mb-2">Pays</label>
                  <input
                    type="text"
                    name="country"
                    placeholder="..."
                    value={shippingDetails.country}
                    onChange={handleShippingChange}
                    className="w-full py-2 bg-transparent border-b border-border text-text-dark focus:outline-none focus:border-green transition-all"
                    required
                  />
                </div>
              </form>
            </div>

            <div className="bg-card border border-border p-10 shadow-sm">
              <h2 className="text-[11px] font-bold uppercase tracking-[0.3em] text-green mb-10 pb-4 border-b border-border/50">
                2. Informations de paiement
              </h2>
              <form id="payment-form" onSubmit={handlePlaceOrder} className="space-y-8">
                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-text-medium font-bold mb-2">Titulaire de la carte</label>
                  <input
                    type="text"
                    name="cardHolder"
                    placeholder="Nom Prénom"
                    value={paymentDetails.cardHolder}
                    onChange={handlePaymentChange}
                    className="w-full py-2 bg-transparent border-b border-border text-text-dark focus:outline-none focus:border-green transition-all"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-text-medium font-bold mb-2">Numéro de carte</label>
                  <input
                    type="text"
                    name="cardNumber"
                    inputMode="numeric"
                    maxLength={16}
                    placeholder="4242424242424242"
                    value={paymentDetails.cardNumber}
                    onChange={handlePaymentChange}
                    className="w-full py-2 bg-transparent border-b border-border text-text-dark focus:outline-none focus:border-green transition-all"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-8">
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest text-text-medium font-bold mb-2">Expiration</label>
                    <input
                      type="text"
                      name="expiry"
                      inputMode="numeric"
                      maxLength={5}
                      placeholder="MM/AA"
                      value={paymentDetails.expiry}
                      onChange={handlePaymentChange}
                      className="w-full py-2 bg-transparent border-b border-border text-text-dark focus:outline-none focus:border-green transition-all"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest text-text-medium font-bold mb-2">CVC</label>
                    <input
                      type="text"
                      name="cvc"
                      inputMode="numeric"
                      maxLength={4}
                      placeholder="123"
                      value={paymentDetails.cvc}
                      onChange={handlePaymentChange}
                      className="w-full py-2 bg-transparent border-b border-border text-text-dark focus:outline-none focus:border-green transition-all"
                      required
                    />
                  </div>
                </div>

                <p className="text-[10px] text-text-light uppercase tracking-[0.2em] leading-relaxed">
                  Simulation : utilisez <strong className="text-text-dark">4242424242424242</strong> pour un succès,
                  ou une carte finissant par <strong className="text-danger">0000</strong> pour simuler un refus.
                </p>

                {paymentError && <div className="text-danger text-[11px] italic mt-4">{paymentError}</div>}
              </form>
            </div>
          </motion.div>

          {/* Order Summary */}
          <motion.div 
            className="lg:w-1/3"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <div className="bg-card border border-border p-10 sticky top-40 shadow-sm">
              <h2 className="text-xl font-serif text-text-dark mb-8">Votre Commande</h2>
              <div className="space-y-6 mb-10">
                {cart.map(item => (
                  <div key={item.id} className="flex justify-between items-start gap-4">
                    <div className="space-y-1">
                      <p className="text-[11px] font-bold text-text-dark uppercase tracking-wider">{item.products.name}</p>
                      <p className="text-[10px] text-text-light uppercase tracking-widest">Quantité: {item.quantity}</p>
                    </div>
                    <p className="text-[11px] font-bold text-text-dark">{(item.products.price * item.quantity).toFixed(2)}€</p>
                  </div>
                ))}
              </div>
              
              <div className="space-y-4 mb-10 pt-8 border-t border-border">
                <div className="flex justify-between text-[11px] uppercase tracking-widest">
                  <span className="text-text-medium">Sous-total</span>
                  <span className="text-text-dark font-bold">{totalPrice.toFixed(2)}€</span>
                </div>
                <div className="flex justify-between text-[11px] uppercase tracking-widest">
                  <span className="text-text-medium">Livraison</span>
                  <span className="text-green font-bold italic">Offerte</span>
                </div>
              </div>
              
              <div className="pt-8 border-t border-border flex justify-between items-end mb-10">
                <span className="text-[12px] font-bold uppercase tracking-[0.2em] text-text-dark">Total</span>
                <span className="text-2xl font-serif text-text-dark">{totalPrice.toFixed(2)}€</span>
              </div>

              <motion.button
                type="submit"
                form="payment-form"
                disabled={isProcessing || !isShippingValid || !isPaymentComplete}
                className="w-full py-5 bg-text-dark text-white text-[11px] font-bold uppercase tracking-[0.2em] hover:bg-green transition-all duration-500 shadow-sm disabled:opacity-30 disabled:cursor-not-allowed"
                whileHover={{ y: -1 }}
                whileTap={{ y: 0 }}
              >
                {isProcessing ? 'Traitement...' : 'Confirmer le paiement'}
              </motion.button>
              
              <p className="text-[9px] text-center text-text-light mt-6 uppercase tracking-widest leading-relaxed">
                Paiement simulé en local <br /> Aucune transaction réelle
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
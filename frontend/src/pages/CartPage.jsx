import React, { useContext } from 'react'
import { Link } from 'react-router-dom'
import CartContext from '../context/CartContext'
import LoadingSpinner from '../components/LoadingSpinner'

export default function CartPage() {
  const { cart, cartCount, loading, updateItemQuantity, removeItem, clearCart } = useContext(CartContext)

  if (loading) {
    return <LoadingSpinner />
  }

  if (!cart || cart.length === 0) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <div className="max-w-md w-full text-center space-y-8">
          <h1 className="text-4xl font-serif text-text-dark">Votre panier est vide</h1>
          <p className="text-[11px] uppercase tracking-[0.2em] text-text-light">
            Découvrez nos pièces d'exception et commencez votre sélection.
          </p>
          <Link to="/" className="inline-block px-10 py-4 bg-text-dark text-white text-[11px] font-bold uppercase tracking-[0.2em] hover:bg-black transition-all duration-500 shadow-sm">
            Explorer le catalogue
          </Link>
        </div>
      </div>
    )
  }

  const totalPrice = cart.reduce((total, item) => total + item.products.price * item.quantity, 0)

  return (
    <div className="min-h-screen bg-background pt-32 pb-24">
      <div className="container mx-auto px-6 md:px-12">
        <h1 className="text-4xl font-serif text-text-dark mb-12">Votre Panier</h1>
        
        <div className="flex flex-col lg:flex-row gap-16">
          <div className="lg:w-2/3 space-y-8">
            {cart.map((item) => (
              <div key={item.id} className="flex flex-col sm:flex-row items-center gap-8 pb-8 border-b border-border group">
                <div className="w-32 aspect-[4/5] overflow-hidden bg-white shrink-0 shadow-sm">
                  <img src={item.products.image || item.products.image_url || '/placeholder.png'} alt={item.products.name} className="w-full h-full object-cover" />
                </div>
                
                <div className="flex-1 min-w-0 space-y-2">
                  <p className="text-[10px] text-text-light uppercase tracking-[0.2em] font-bold">{item.products.category || 'Édition Limitée'}</p>
                  <h2 className="text-lg font-serif text-text-dark">{item.products.name}</h2>
                  <p className="text-[13px] text-text-medium font-light italic">Ref: {item.id.slice(0, 8)}</p>
                </div>

                <div className="flex items-center gap-12">
                  <div className="flex items-center border border-border px-3 py-1">
                    <button
                      onClick={() => updateItemQuantity(item.id, item.quantity - 1)}
                      className="w-6 h-6 text-text-light hover:text-black transition-colors"
                      disabled={item.quantity <= 1}
                    >
                      -
                    </button>
                    <span className="w-8 text-center text-[11px] font-bold text-text-dark">{item.quantity}</span>
                    <button
                      onClick={() => updateItemQuantity(item.id, item.quantity + 1)}
                      className="w-6 h-6 text-text-light hover:text-black transition-colors"
                    >
                      +
                    </button>
                  </div>
                  
                  <div className="text-right min-w-[80px]">
                    <p className="text-[13px] font-bold text-text-dark">{(item.products.price * item.quantity).toFixed(2)}€</p>
                  </div>

                  <button 
                    onClick={() => removeItem(item.id)} 
                    className="text-text-light hover:text-danger transition-colors p-2"
                    title="Supprimer"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
            
            <div className="pt-4">
              <button 
                onClick={clearCart} 
                className="text-[10px] uppercase tracking-widest text-text-light hover:text-danger font-bold border-b border-transparent hover:border-danger transition-all pb-1"
              >
                Vider le panier
              </button>
            </div>
          </div>

          <div className="lg:w-1/3">
            <div className="bg-card border border-border p-10 sticky top-40 shadow-sm">
              <h2 className="text-xl font-serif text-text-dark mb-8">Résumé</h2>
              
              <div className="space-y-4 mb-8">
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

              <Link 
                to="/checkout" 
                className="block w-full py-5 bg-text-dark text-white text-center text-[11px] font-bold uppercase tracking-[0.2em] hover:bg-black transition-all duration-500 shadow-sm"
              >
                Passer au paiement
              </Link>
              
              <p className="text-[9px] text-center text-text-light mt-6 uppercase tracking-widest leading-relaxed">
                Paiement sécurisé <br /> Livraison premium assurée
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

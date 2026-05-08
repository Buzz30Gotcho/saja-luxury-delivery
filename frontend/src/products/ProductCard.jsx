import React, { useContext } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import CartContext from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

const ProductCard = ({ product }) => {
  const { addItem } = useContext(CartContext);
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user?.id) {
      navigate('/login', { state: { from: location.pathname } });
      return;
    }

    try {
      await addItem(product);
    } catch (error) {
      console.error('Erreur ajout panier:', error);
    }
  };

  const handleCardClick = (e) => {
    // Empêche la navigation si on clique sur le bouton
    if (e.target.closest('button')) return;
    navigate(`/product/${product.id}`);
  };

  return (
    <div 
      onClick={handleCardClick}
      className="block group cursor-pointer"
    >
      <div className="product-card bg-background rounded-lg shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden">
        {/* Image avec overlay au survol */}
        <div className="relative overflow-hidden">
          <img 
            src={product.image} 
            alt={product.name} 
            className="w-full h-64 object-cover group-hover:scale-102 transition-transform duration-300"
          />
          <div className="absolute inset-0 bg-text-dark bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-300"></div>
          
          {/* Bouton ajouter au panier */}
          <button
            onClick={handleAddToCart}
            className="absolute bottom-4 right-4 bg-background hover:bg-neutral-light text-text-dark px-4 py-2 rounded-full font-medium shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center space-x-2"
          >
            <span>🛒</span>
            <span>Ajouter</span>
          </button>
        </div>

        {/* Informations produit */}
        <div className="p-4">
          <h4 className="font-semibold text-lg text-text-dark mb-2 line-clamp-2 group-hover:text-black transition-colors">
            {product.name}
          </h4>
          <p className="text-base md:text-lg mb-3 line-clamp-2 text-text-medium leading-relaxed font-light italic">
            {product.description}
          </p>
          
          <div className="flex items-center justify-between">
            <div className="text-xl font-bold text-text-dark">
              {product.price}€
            </div>
            
            {/* Badge livraison */}
            <div className="flex items-center space-x-1 text-[10px] uppercase tracking-widest text-text-medium bg-neutral-100 px-3 py-1 rounded-none font-bold">
              <span>🚗</span>
              <span>Express</span>
            </div>
          </div>

          {/* Boutique */}
          {product.shop && (
            <div className="mt-3 pt-3 border-t border-neutral-light">
              <div className="flex items-center space-x-2">
                <div className="w-7 h-7 bg-neutral-light rounded-full flex items-center justify-center text-sm">
                  🏪
                </div>
                <span className="text-sm font-medium text-text-medium">{product.shop.name}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
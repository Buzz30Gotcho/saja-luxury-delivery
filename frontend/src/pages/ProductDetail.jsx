import React, { useState, useContext } from 'react';
import { useParams, Link, useLocation, useNavigate } from 'react-router-dom';
import { useProduct } from '../hooks/useProduct';
import CartContext from '../context/CartContext';
import LoadingSpinner from '../components/LoadingSpinner';
import { useAuth } from '../context/AuthContext';

import SimilarProducts from '../components/SimilarProducts';

const ProductDetail = () => {
  const { id } = useParams();
  const { product, loading, error } = useProduct(id);
  const { addItem } = useContext(CartContext);
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [quantity, setQuantity] = useState(1);
  const [isAdded, setIsAdded] = useState(false);
  const [addError, setAddError] = useState('');

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background pt-20">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-6">
          <h2 className="text-3xl font-serif text-text-dark">Produit non trouvé</h2>
          <p className="text-[11px] uppercase tracking-[0.2em] text-text-light max-w-xs mx-auto italic">{error}</p>
          <Link to="/shops" className="inline-block px-10 py-4 bg-text-dark text-white text-[11px] font-bold uppercase tracking-[0.2em] hover:bg-green transition-colors duration-200 shadow-sm">
            Retour aux boutiques
          </Link>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-6">
          <h2 className="text-3xl font-serif text-text-dark">Pièce introuvable</h2>
          <Link to="/shops" className="inline-block px-10 py-4 bg-text-dark text-white text-[11px] font-bold uppercase tracking-[0.2em] hover:bg-green transition-colors duration-200 shadow-sm">
            Explorer les boutiques
          </Link>
        </div>
      </div>
    );
  }

  const handleAddToCart = async () => {
    if (!user?.id) {
      navigate('/login', { state: { from: location.pathname } });
      return;
    }

    try {
      setAddError('');
      await addItem(product, quantity);
      setIsAdded(true);
      setTimeout(() => {
        setIsAdded(false);
      }, 2000);
    } catch (err) {
      setAddError(err?.message || 'Impossible d’ajouter au panier pour le moment.');
    }
  };

  return (
    <div className="product-detail-page bg-background min-h-screen pt-32 pb-24">
      <div className="container mx-auto px-6 md:px-12">
        {/* Breadcrumbs */}
        <div className="mb-12 flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-text-light font-bold">
          <Link to="/" className="hover:text-green transition-colors">Accueil</Link>
          <span>/</span>
          <Link to="/shops" className="hover:text-green transition-colors">Boutiques</Link>
          <span>/</span>
          <span className="text-text-medium">{product.name}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 xl:gap-24">
          {/* Image du produit */}
          <div className="relative aspect-[4/5] bg-white overflow-hidden shadow-sm">
            <img
              src={product.image || '/placeholder.png'}
              alt={product.name}
              className="w-full h-full object-cover"
            />
            {product.shops && (
              <Link 
                to={`/shop/${product.shops.id}`}
                className="absolute top-6 left-6 bg-white/90 backdrop-blur-sm px-4 py-3 shadow-sm flex items-center gap-3 hover:bg-white transition-colors duration-150"
              >
                <img src={product.shops.image || '/placeholder.png'} alt={product.shops.name} className="w-6 h-6 rounded-full object-cover" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-text-dark">{product.shops.name}</span>
              </Link>
            )}
          </div>

          {/* Détails du produit */}
          <div className="flex flex-col">
            <div className="mb-8">
              <p className="text-[10px] text-green uppercase tracking-[0.3em] font-bold mb-4">
                {product.category || 'Édition Limitée'}
              </p>
              <h1 className="text-4xl md:text-5xl font-serif text-text-dark mb-6 leading-tight">
                {product.name}
              </h1>
              <div className="text-2xl font-serif text-text-dark">
                {product.price}€
              </div>
            </div>

            <div className="mb-12 space-y-6">
              <div className="w-12 h-[1px] bg-border"></div>
              <p className="text-[13px] text-text-medium leading-relaxed font-light">
                {product.description}
              </p>
            </div>

            {/* Sélecteur de quantité et bouton ajouter */}
            <div className="space-y-8 pt-8 border-t border-border">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase tracking-widest text-text-medium font-bold">Quantité</span>
                <div className="flex items-center border border-border px-4 py-2">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-8 h-8 text-text-light hover:text-green transition-colors disabled:opacity-30"
                    disabled={isAdded || quantity <= 1}
                  >
                    -
                  </button>
                  <span className="w-12 text-center text-[12px] font-bold text-text-dark">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-8 h-8 text-text-light hover:text-green transition-colors disabled:opacity-30"
                    disabled={isAdded || (product.stock && quantity >= product.stock)}
                  >
                    +
                  </button>
                </div>
              </div>

              <button
                onClick={handleAddToCart}
                disabled={isAdded || (product.stock && product.stock === 0)}
                className={`w-full py-5 text-[11px] font-bold uppercase tracking-[0.2em] transition-colors duration-200 flex items-center justify-center gap-3 shadow-sm ${
                  isAdded
                    ? 'bg-success text-white cursor-not-allowed'
                    : (product.stock && product.stock === 0) 
                    ? 'bg-muted text-text-light cursor-not-allowed'
                    : 'bg-text-dark text-white hover:bg-green'
                }`}
              >
                {isAdded ? (
                  "Ajouté au panier"
                ) : (product.stock && product.stock === 0) ? (
                  "Rupture de stock"
                ) : (
                  <>
                    <span>Ajouter au panier</span>
                    <span className="w-4 h-[1px] bg-white/30"></span>
                    <span>{(product.price * quantity).toFixed(2)}€</span>
                  </>
                )}
              </button>

              {addError && (
                <p className="text-[10px] uppercase tracking-[0.15em] text-red-500 text-center">
                  {addError}
                </p>
              )}
            </div>

            {/* Livraison / Stock Infos */}
            <div className="mt-12 grid grid-cols-2 gap-8 py-8 border-y border-border">
              <div>
                <span className="block text-[9px] uppercase tracking-widest text-text-light mb-2">Disponibilité</span>
                <span className="text-[11px] font-bold text-text-dark uppercase tracking-wider">
                  {product.stock && product.stock > 0 ? `${product.stock} Pièces` : 'Sur Commande'}
                </span>
              </div>
              <div>
                <span className="block text-[9px] uppercase tracking-widest text-text-light mb-2">Livraison</span>
                <span className="text-[11px] font-bold text-text-dark uppercase tracking-wider">
                  {product.shops?.delivery_time || 'Standard (2-4 jours)'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {product.shops && (
          <div className="mt-32">
            <SimilarProducts shopId={product.shops.id} currentProductId={product.id} />
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductDetail;
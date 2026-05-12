import React, { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom'; // Corrige l'import
import { motion, AnimatePresence } from 'framer-motion';

import { 
  Star, 
  Heart, 
  ShoppingCart, 
  Filter, 
  Grid, 
  List, 
  Search,
  ChevronDown,
  Truck,
  Shield,
  Clock
} from 'lucide-react';

import { useShop } from '../hooks/useShop';
import LoadingSpinner from '../components/LoadingSpinner';

const ShopDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate(); // useNavigate est maintenant importé
  const { shop, loading, error } = useShop(id);

  // states
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [genderFilter, setGenderFilter] = useState('all'); // 'all' | 'homme' | 'femme' | 'unisexe'
  const [sortBy, setSortBy] = useState('popular');
  const [viewMode, setViewMode] = useState('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [priceRange, setPriceRange] = useState([0, 1000]);
  const [favorites, setFavorites] = useState(new Set());
  const [cart, setCart] = useState([]);
  const [showFilters, setShowFilters] = useState(false);

  // derived categories from shop products
  const categories = useMemo(() => {
    if (!shop?.products) return ['all'];
    const unique = [...new Set(shop.products.map(p => p.category || 'Autres'))];
    return ['all', ...unique];
  }, [shop?.products]);

  // filtered + sorted products
  const filteredProducts = useMemo(() => {
    if (!shop?.products) return [];

    const q = searchQuery.trim().toLowerCase();

    let filtered = shop.products.filter(product => {
      const matchesCategory = selectedCategory === 'all' || (product.category === selectedCategory);
      const matchesSearch = !q ||
        (product.name && product.name.toLowerCase().includes(q)) ||
        (product.description && product.description.toLowerCase().includes(q));
      const matchesPrice = (typeof product.price === 'number') && product.price >= priceRange[0] && product.price <= priceRange[1];

      // normalize gender values (allow 'homme'/'male','femme'/'female','unisexe'/'unisex')
      const g = (product.gender || 'unisexe').toString().toLowerCase();
      const normGender = g === 'male' ? 'homme' : g === 'female' ? 'femme' : g === 'unisex' ? 'unisexe' : g;

      const matchesGender = genderFilter === 'all' || normGender === genderFilter;

      return matchesCategory && matchesSearch && matchesPrice && matchesGender;
    });

    // sorting
    switch (sortBy) {
      case 'price-low':
        filtered.sort((a, b) => (a.price || 0) - (b.price || 0));
        break;
      case 'price-high':
        filtered.sort((a, b) => (b.price || 0) - (a.price || 0));
        break;
      case 'name':
        filtered.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
        break;
      case 'popular':
      default:
        filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
    }

    return filtered;
  }, [shop?.products, selectedCategory, searchQuery, sortBy, priceRange, genderFilter]);

  // favorites toggle
  const toggleFavorite = (productId) => {
    setFavorites(prev => {
      const next = new Set(prev);
      next.has(productId) ? next.delete(productId) : next.add(productId);
      return next;
    });
  };

  // cart add
  const addToCart = (product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <div className="error-message">Erreur: {error}</div>;
  if (!shop) return <div className="not-found">Boutique non trouvée</div>;

  return (
    <div className="min-h-screen bg-background pt-32 pb-24">
      {/* Header */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="container mx-auto px-6 md:px-12 mb-24">
        <div className="flex flex-col lg:flex-row gap-16 items-start">
          <motion.div className="lg:w-2/5 aspect-[4/5] overflow-hidden bg-white shadow-sm">
            <img src={shop.image} alt={shop.name} className="w-full h-full object-cover transition-transform duration-700 hover:scale-105" />
          </motion.div>

          <div className="lg:w-3/5 space-y-10">
            <div>
              <div className="flex justify-between items-start mb-6">
                <div>
                  <p className="text-[12px] text-text-light uppercase tracking-[0.4em] font-bold mb-4">{shop.category}</p>
                  <h1 className="text-4xl md:text-6xl font-serif text-text-dark tracking-tight">{shop.name}</h1>
                </div>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="p-4 border border-border text-text-light hover:text-red-500 hover:border-red-500 transition-all duration-300"
                >
                  <Heart className="w-5 h-5" />
                </motion.button>
              </div>
              <div className="w-12 h-[1px] bg-text-dark mb-8"></div>
              <p className="text-[17px] text-text-medium leading-relaxed font-light italic max-w-2xl">{shop.description}</p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-12 py-8 border-y border-border">
              <div className="space-y-2 text-center md:text-left">
                <span className="block text-[11px] uppercase tracking-widest text-text-light">Avis Client</span>
                <div className="flex items-center justify-center md:justify-start gap-2">
                  <Star className="w-3 h-3 text-text-dark" fill="currentColor" />
                  <span className="text-[13px] font-bold text-text-dark uppercase tracking-widest">{shop.rating ?? '5.0'}</span>
                </div>
              </div>
              <div className="space-y-2 text-center md:text-left">
                <span className="block text-[11px] uppercase tracking-widest text-text-light">Livraison</span>
                <span className="text-[13px] font-bold text-text-dark uppercase tracking-widest">{shop.delivery_time ?? '2-4 Jours'}</span>
              </div>
              <div className="space-y-2 text-center md:text-left">
                <span className="block text-[11px] uppercase tracking-widest text-text-light">Frais</span>
                <span className="text-[13px] font-bold text-text-dark uppercase tracking-widest">{shop.delivery_fee ? `${shop.delivery_fee}€` : 'Gratuit'}</span>
              </div>
              <div className="space-y-2 text-center md:text-left">
                <span className="block text-[11px] uppercase tracking-widest text-text-light">Minimum</span>
                <span className="text-[13px] font-bold text-text-dark uppercase tracking-widest">{shop.minimum_order ?? '0'}€</span>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              {shop.tags?.map((tag, i) => (
                <span key={i} className="px-4 py-2 border border-border text-[11px] text-text-medium uppercase tracking-[0.2em] font-bold">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Controls bar */}
      <div className="bg-white border-y border-border sticky top-0 z-40 mb-16 shadow-sm">
        <div className="container mx-auto px-6 md:px-12 py-8">
          <div className="flex flex-col lg:flex-row gap-10 items-center justify-between">
            <div className="flex items-center gap-16 w-full lg:w-auto">
              <div className="relative group min-w-[300px]">
                <Search className="absolute left-0 top-1/2 transform -translate-y-1/2 text-text-light group-focus-within:text-text-dark transition-colors" size={18} />
                <input
                  type="text"
                  placeholder="RECHERCHER..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8 py-3 bg-transparent border-b border-transparent focus:border-text-dark text-sm uppercase tracking-[0.25em] focus:outline-none transition-all placeholder:text-text-light/50"
                />
              </div>
              
              <div className="hidden md:flex gap-10">
                {['all', 'homme', 'femme'].map(g => (
                  <button
                    key={g}
                    onClick={() => setGenderFilter(g)}
                    className={`text-sm uppercase tracking-[0.2em] font-bold transition-all pb-1 ${
                      genderFilter === g ? 'text-text-dark border-b-2 border-text-dark' : 'text-text-light hover:text-text-dark'
                    }`}
                  >
                    {g === 'all' ? 'Univers' : g}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-12 w-full lg:w-auto justify-between lg:justify-end">
              <div className="relative">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="bg-transparent text-sm font-bold uppercase tracking-[0.2em] text-text-dark focus:outline-none cursor-pointer pr-4 appearance-none"
                >
                  {categories.map(category => (
                    <option key={category} value={category}>
                      {category === 'all' ? 'Catégories' : category}
                    </option>
                  ))}
                </select>
              </div>

              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-transparent text-sm font-bold uppercase tracking-[0.2em] text-text-dark focus:outline-none cursor-pointer appearance-none"
                >
                  <option value="popular">Populaires</option>
                  <option value="price-low">Prix Croissant</option>
                  <option value="price-high">Prix Décroissant</option>
                </select>
              </div>

              <div className="flex gap-6 border-l border-border pl-12">
                <button onClick={() => setViewMode('grid')} className={`p-1 transition-colors ${viewMode === 'grid' ? 'text-text-dark' : 'text-text-light hover:text-text-dark'}`}><Grid size={22} /></button>
                <button onClick={() => setViewMode('list')} className={`p-1 transition-colors ${viewMode === 'list' ? 'text-text-dark' : 'text-text-light hover:text-text-dark'}`}><List size={22} /></button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Products list */}
      <div className="container mx-auto px-6 md:px-12">
        {viewMode === 'grid' ? (
          <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-8 gap-y-16">
            <AnimatePresence>
              {filteredProducts.map((product, index) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  index={index}
                  isFavorite={favorites.has(product.id)}
                  onToggleFavorite={() => toggleFavorite(product.id)}
                  onAddToCart={() => addToCart(product)}
                  onClick={() => navigate(`/product/${product.id}`)}
                />
              ))}
            </AnimatePresence>
          </motion.div>
        ) : (
          <motion.div layout className="space-y-12">
            <AnimatePresence>
              {filteredProducts.map((product, index) => (
                <ProductRow
                  key={product.id}
                  product={product}
                  index={index}
                  isFavorite={favorites.has(product.id)}
                  onToggleFavorite={() => toggleFavorite(product.id)}
                  onAddToCart={() => addToCart(product)}
                  onClick={() => navigate(`/product/${product.id}`)}
                />
              ))}
            </AnimatePresence>
          </motion.div>
        )}

        {filteredProducts.length === 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-32 border border-dashed border-border">
             <p className="text-[11px] uppercase tracking-widest text-text-light">Aucun produit ne correspond à votre sélection.</p>
          </motion.div>
        )}
      </div>
    </div>
  );
};

/* -----------------------------
   ProductCard (grid) & ProductRow (list)
   ----------------------------- */

const ProductCard = ({ product, index, isFavorite, onToggleFavorite, onAddToCart, onClick }) => (
  <motion.div
    layout
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: index * 0.05 }}
    className="group cursor-pointer"
    onClick={onClick}
  >
    <div className="relative aspect-[4/5] overflow-hidden bg-white mb-6">
      <img src={product.image} alt={product.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
      <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <button 
          onClick={(e) => { e.stopPropagation(); onToggleFavorite(); }} 
          className={`p-3 bg-white/90 backdrop-blur-sm shadow-sm transition-colors ${isFavorite ? 'text-red-500' : 'text-text-light hover:text-red-500'}`}
        >
          <Heart size={14} fill={isFavorite ? "currentColor" : "none"} />
        </button>
      </div>
      {product.price && (
        <div className="absolute bottom-4 left-4">
          <span className="bg-white/90 backdrop-blur-sm text-text-dark px-4 py-2 text-[10px] font-bold uppercase tracking-widest shadow-sm">
            {product.price}€
          </span>
        </div>
      )}
    </div>

    <div className="space-y-1 text-center lg:text-left">
      <p className="text-xs text-text-light uppercase tracking-[0.2em] font-medium">{product.category}</p>
      <h3 className="text-sm font-bold text-text-dark uppercase tracking-wider group-hover:text-black transition-colors">{product.name}</h3>
    </div>
  </motion.div>
);

const ProductRow = ({ product, index, isFavorite, onToggleFavorite, onAddToCart, onClick }) => (
  <motion.div 
    layout 
    initial={{ opacity: 0, x: -10 }} 
    animate={{ opacity: 1, x: 0 }} 
    transition={{ delay: index * 0.05 }} 
    className="flex gap-12 group cursor-pointer border-b border-border pb-12"
    onClick={onClick}
  >
    <div className="w-48 aspect-[4/5] overflow-hidden bg-white">
      <img src={product.image} alt={product.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
    </div>
    <div className="flex-1 flex flex-col justify-center">
      <div className="flex justify-between items-start mb-4">
        <div>
          <p className="text-xs text-text-light uppercase tracking-[0.3em] font-bold mb-2">{product.category}</p>
          <h3 className="text-2xl font-serif text-text-dark mb-4">{product.name}</h3>
          <p className="text-[13px] text-text-medium leading-relaxed font-light line-clamp-2 max-w-xl italic">{product.description}</p>
        </div>
        <div className="flex items-center gap-6">
          <div className="text-right">
            <span className="text-2xl font-serif text-text-dark">{product.price}€</span>
          </div>
          <button 
            onClick={(e) => { e.stopPropagation(); onToggleFavorite(); }} 
            className={`p-4 border border-border transition-all ${isFavorite ? 'text-red-500 border-red-500' : 'text-text-light hover:text-text-dark'}`}
          >
            <Heart size={16} fill={isFavorite ? "currentColor" : "none"} />
          </button>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Star className="w-3 h-3 text-text-dark" fill="currentColor" />
        <span className="text-xs font-bold text-text-dark uppercase tracking-widest">{product.rating ?? '5.0'}</span>
      </div>
    </div>
  </motion.div>
);

export default ShopDetail;
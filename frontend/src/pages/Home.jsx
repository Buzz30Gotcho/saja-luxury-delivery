import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useShops } from '../hooks/useShops';
import { useProducts } from '../hooks/useProduct';
import LoadingSpinner from '../components/LoadingSpinner';
import { motion } from 'framer-motion';
import heroImage from '/hero-luxury.jpg';
import { Truck, ArrowRight, Package, Clock, Shield, Search, Star, Zap, Flame, Sparkles, Shirt, Footprints, Watch, ShoppingBag } from 'lucide-react';
import ShopCard from '../components/ShopCard';

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.6, ease: [0.25, 0.1, 0.25, 1] },
  }),
};

const stagger = {
  visible: { transition: { staggerChildren: 0.08 } },
};

const CATEGORIES = [
  { id: 'femme', name: 'Femmes', icon: <ShoppingBag size={24} />, color: 'bg-pink-50' },
  { id: 'homme', name: 'Hommes', icon: <Shirt size={24} />, color: 'bg-blue-50' },
  { id: 'enfant', name: 'Enfants', icon: <Sparkles size={24} />, color: 'bg-yellow-50' },
  { id: 'sneakers', name: 'Sneakers', icon: <Footprints size={24} />, color: 'bg-orange-50' },
  { id: 'accessoires', name: 'Accessoires', icon: <Watch size={24} />, color: 'bg-purple-50' },
];

const Home = () => {
  const { user, loading: authLoading } = useAuth();
  const { shops, loading: shopsLoading } = useShops();
  const { products, loading: productsLoading } = useProducts();
  const [searchQuery, setSearchQuery] = useState('');

  // Simuler des classements comme demandés dans le croquis
  const popularShops = shops ? [...shops].sort(() => 0.5 - Math.random()).slice(0, 3) : [];
  const fastDeliveryShops = shops ? [...shops].slice(0, 3) : [];
  const newShops = shops ? [...shops].reverse().slice(0, 3) : [];
  
  const signatureProducts = products ? products.slice(0, 4) : [];

  return (
    <div className="min-h-screen bg-[#FDFCFB]">
      {authLoading && <div className="fixed top-0 left-0 w-full h-1 bg-black/5 animate-pulse z-[9999]" />}
      
      {/* 1. HERO SECTION */}
      <section className="relative h-[80vh] min-h-[600px] flex items-center overflow-hidden bg-[#FDFCFB]">
        <div className="absolute top-20 right-[-10%] w-[500px] h-[500px] bg-[#F5F3EF] rounded-full blur-[120px] pointer-events-none opacity-50" />
        <div className="absolute bottom-[-10%] left-[-5%] w-[400px] h-[400px] bg-[#EAE8E4] rounded-full blur-[100px] pointer-events-none opacity-30" />
        
        <div className="container mx-auto px-6 md:px-12 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            <motion.div initial="hidden" animate="visible" variants={stagger} className="lg:col-span-7 space-y-8 md:space-y-12">
              <motion.div variants={fadeUp} custom={0}>
                <span className="text-[11px] tracking-[0.8em] uppercase font-black text-[#A69F95] mb-6 block">
                  DripSwift &bull; Excellence
                </span>
                <h1 className="text-6xl md:text-8xl lg:text-[100px] font-serif leading-[0.9] text-text-dark tracking-tighter">
                  Le luxe,<br />
                  <span className="italic font-light text-[#A69F95] md:pl-20">
                    sans attente.
                  </span>
                </h1>
              </motion.div>

              {/* SEARCH BAR - Ajouté selon croquis */}
              <motion.div variants={fadeUp} custom={1} className="relative max-w-2xl group">
                <div className="absolute inset-y-0 left-6 flex items-center pointer-events-none text-text-light group-focus-within:text-black transition-colors">
                  <Search size={20} />
                </div>
                <input 
                  type="text"
                  placeholder="Rechercher une boutique ou un article..."
                  className="w-full bg-white border border-[#EAE8E4] py-6 pl-16 pr-6 shadow-xl focus:outline-none focus:border-black transition-all text-sm uppercase tracking-widest"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </motion.div>

              <motion.div variants={fadeUp} custom={2} className="flex flex-col sm:flex-row gap-8 items-start sm:items-center pt-4">
                <Link to="/shops" className="group relative inline-block bg-black text-white px-14 py-6 text-[11px] uppercase tracking-[0.4em] font-black overflow-hidden transition-all duration-500">
                  <span className="relative z-10 group-hover:text-black transition-colors duration-500">Explorer l'univers</span>
                  <div className="absolute inset-0 bg-white translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
                </Link>
              </motion.div>
            </motion.div>

            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }} className="lg:col-span-5 relative">
              <div className="relative z-10 w-full max-w-[520px] ml-auto">
                <div className="aspect-[4/5] bg-[#F5F3EF] overflow-hidden shadow-2xl border-[14px] border-white relative group">
                  <motion.img initial={{ scale: 1.2 }} animate={{ scale: 1 }} transition={{ duration: 2, ease: "easeOut" }} src={heroImage} alt="Luxury Experience" className="w-full h-full object-cover grayscale-[20%] group-hover:grayscale-0 transition-all duration-1000" />
                  <div className="absolute inset-0 bg-black/5 group-hover:bg-transparent transition-colors duration-700" />
                </div>
                <div className="absolute -top-6 -right-6 p-8 bg-white shadow-2xl hidden md:block border border-[#EAE8E4] z-20">
                  <div className="space-y-2">
                    <p className="text-[10px] uppercase tracking-[0.4em] font-black text-[#A69F95]">Signature</p>
                    <p className="text-lg font-serif italic text-text-dark leading-snug">L'excellence,<br/>à votre porte.</p>
                    <div className="w-8 h-[1px] bg-text-dark mt-4" />
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 2. CATEGORY ICONS STRIP - Ajouté selon croquis */}
      <section className="py-12 bg-white border-b border-border">
        <div className="container mx-auto px-6">
          <div className="flex justify-between items-center gap-4 overflow-x-auto pb-4 no-scrollbar">
            {CATEGORIES.map((cat, i) => (
              <Link 
                key={cat.id} 
                to={`/catalogue?category=${cat.id}`}
                className="flex flex-col items-center min-w-[100px] group"
              >
                <div className={`w-16 h-16 ${cat.color} rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300 border border-transparent group-hover:border-black/10`}>
                  <div className="text-text-dark">{cat.icon}</div>
                </div>
                <span className="text-[10px] uppercase tracking-[0.2em] font-black text-text-medium group-hover:text-black">
                  {cat.name}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 3. CLASSEMENTS DES BOUTIQUES - Ajouté selon croquis */}
      
      {/* SECTION : POPULAIRES */}
      <section className="py-20 bg-[#FDFCFB]">
        <div className="container mx-auto px-6 md:px-12">
          <div className="flex items-center justify-between mb-12">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-yellow-50 text-yellow-600 rounded-full">
                <Star size={20} fill="currentColor" />
              </div>
              <h2 className="text-2xl md:text-3xl font-serif text-text-dark">Les plus populaires</h2>
            </div>
            <Link to="/shops" className="text-[10px] font-black uppercase tracking-widest border-b border-black pb-1">Tout voir</Link>
          </div>
          {shopsLoading ? <LoadingSpinner /> : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
              {popularShops.map((shop) => <ShopCard key={shop.id} shop={shop} />)}
            </div>
          )}
        </div>
      </section>

      {/* SECTION : LIVRAISON RAPIDE */}
      <section className="py-20 bg-white border-y border-border">
        <div className="container mx-auto px-6 md:px-12">
          <div className="flex items-center justify-between mb-12">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-50 text-blue-600 rounded-full">
                <Zap size={20} fill="currentColor" />
              </div>
              <h2 className="text-2xl md:text-3xl font-serif text-text-dark">Livraison la plus rapide</h2>
            </div>
            <Link to="/shops" className="text-[10px] font-black uppercase tracking-widest border-b border-black pb-1">Tout voir</Link>
          </div>
          {shopsLoading ? <LoadingSpinner /> : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
              {fastDeliveryShops.map((shop) => <ShopCard key={shop.id} shop={shop} />)}
            </div>
          )}
        </div>
      </section>

      {/* SECTION : NOUVEAUTÉS */}
      <section className="py-20 bg-[#FDFCFB]">
        <div className="container mx-auto px-6 md:px-12">
          <div className="flex items-center justify-between mb-12">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-orange-50 text-orange-600 rounded-full">
                <Flame size={20} fill="currentColor" />
              </div>
              <h2 className="text-2xl md:text-3xl font-serif text-text-dark">Nouveautés</h2>
            </div>
            <Link to="/shops" className="text-[10px] font-black uppercase tracking-widest border-b border-black pb-1">Tout voir</Link>
          </div>
          {shopsLoading ? <LoadingSpinner /> : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
              {newShops.map((shop) => <ShopCard key={shop.id} shop={shop} />)}
            </div>
          )}
        </div>
      </section>

      {/* 4. SIGNATURE PIECES */}
      <section className="py-28 bg-white border-t border-border">
        <div className="container mx-auto px-6 md:px-12">
          <div className="text-center mb-20 space-y-6">
            <span className="text-xs md:text-sm text-[#A69F95] uppercase tracking-[0.6em] font-black">L'Art de Vivre</span>
            <h2 className="text-4xl md:text-5xl font-serif text-text-dark tracking-tight">Pièces Signatures</h2>
            <div className="w-16 h-[1px] bg-text-dark mx-auto" />
          </div>

          {productsLoading ? (
            <div className="py-20 flex justify-center"><LoadingSpinner /></div>
          ) : (
            <motion.div variants={stagger} initial="hidden" whileInView="visible" viewport={{ once: true }} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {signatureProducts.map((product, i) => (
                <motion.div key={product.id} variants={fadeUp} custom={i}>
                  <Link to={`/product/${product.id}`} className="group block">
                    <div className="relative aspect-[4/5] overflow-hidden bg-[#FDFCFB] mb-6">
                      <img src={product.image} alt={product.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-300" />
                      <div className="absolute bottom-6 left-6">
                        <span className="bg-white/95 backdrop-blur-sm text-text-dark px-4 py-2 text-sm font-black uppercase tracking-widest shadow-sm">
                          {product.price}€
                        </span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <p className="text-[11px] text-[#A69F95] uppercase tracking-[0.3em] font-black">{product.category}</p>
                      <h3 className="text-base md:text-lg font-bold text-text-dark uppercase tracking-widest group-hover:text-black transition-colors">{product.name}</h3>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </section>

      {/* 5. SERVICES SECTION */}
      <section className="py-28 bg-[#FDFCFB] border-t border-border">
        <div className="container mx-auto px-6 md:px-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { icon: <Package size={24} />, title: "Emballage Signature", desc: "Packaging luxueux avec ruban satin" },
              { icon: <Clock size={24} />, title: "Express Premium", desc: "Livraison en 2h chrono" },
              { icon: <Shield size={24} />, title: "Assurance Totale", desc: "Protection intégrale de vos achats" },
              { icon: <Truck size={24} />, title: "White Glove", desc: "Service concierge à domicile" }
            ].map((service, i) => (
              <div key={i} className="bg-white p-8 border border-[#EAE8E4] space-y-4">
                <div className="text-[#A69F95]">{service.icon}</div>
                <h3 className="text-[10px] font-black uppercase tracking-widest text-text-dark">{service.title}</h3>
                <p className="text-xs text-text-medium italic font-light">{service.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useShops } from '../hooks/useShops';
import { useProducts } from '../hooks/useProduct';
import LoadingSpinner from '../components/LoadingSpinner';
import { motion } from 'framer-motion';
import heroImage from '/hero-luxury.jpg';
import { Search, Star, Truck, ShieldCheck, ArrowRight, Heart, Package, Clock, Shield } from 'lucide-react';
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

const Home = () => {
  const { user, loading: authLoading } = useAuth();
  
  // Limiter à une sélection de boutiques et produits pour l'effet éditorial
  const { shops, loading: shopsLoading } = useShops();
  const { products, loading: productsLoading } = useProducts();

  const featuredShops = shops ? shops.slice(0, 3) : [];
  const signatureProducts = products ? products.slice(0, 4) : [];

  return (
    <div className="min-h-screen bg-background">
      {/* Afficher un message de chargement plus discret si authLoading est vrai */}
      {authLoading && <div className="fixed top-0 left-0 w-full h-1 bg-green animate-pulse z-[9999]" />}
      
      {/* New Reinvented Hero - Bold Minimalism */}
      <section className="relative min-h-[90vh] flex items-center bg-[#0a0a0a] overflow-hidden">
        {/* Abstract Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-green/10 blur-[120px] rounded-full animate-pulse" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-white/5 blur-[120px] rounded-full" />
        </div>

        <div className="container mx-auto px-6 md:px-12 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left side: Typography focus */}
            <div className="lg:col-span-7">
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              >
                <div className="mb-6 overflow-hidden">
                  <motion.span 
                    initial={{ y: "100%" }}
                    animate={{ y: 0 }}
                    transition={{ delay: 0.2, duration: 0.5 }}
                    className="inline-block text-green font-bold tracking-[0.5em] uppercase text-xs md:text-sm"
                  >
                    L'Excellence à votre porte
                  </motion.span>
                </div>
                
                <h1 className="text-6xl md:text-8xl lg:text-9xl font-serif text-white leading-[0.9] tracking-tighter mb-8">
                  Drip <br />
                  <span className="italic font-light text-white/40">Swift.</span>
                </h1>
                
                <p className="text-white/60 text-lg md:text-xl max-w-lg mb-12 font-light leading-relaxed">
                  Plus qu'une livraison, une signature. Découvrez les boutiques les plus prestigieuses de votre ville, livrées avec une élégance absolue.
                </p>
                
                <div className="flex flex-col sm:flex-row gap-6">
                  <Link to="/shops" className="group relative bg-white text-black px-10 py-5 text-sm font-bold uppercase tracking-widest overflow-hidden transition-all duration-300">
                    <span className="relative z-10">Explorer l'Excellence</span>
                    <div className="absolute inset-0 bg-green translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                  </Link>
                  <Link to="/catalogue" className="px-10 py-5 text-sm font-bold uppercase tracking-widest border border-white/20 text-white hover:border-white transition-colors duration-300">
                    Voir le catalogue
                  </Link>
                </div>
              </motion.div>
            </div>

            {/* Right side: Modern Visual Element (Replacement for hero image) */}
            <div className="lg:col-span-5 relative hidden lg:block">
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 1, ease: "easeOut" }}
                className="relative aspect-[4/5] flex items-center justify-center"
              >
                {/* Logo Floating in a Premium Frame */}
                <div className="absolute inset-0 border border-white/10 rounded-[40px] rotate-3 translate-x-4" />
                <div className="absolute inset-0 border border-white/5 rounded-[40px] -rotate-3 -translate-x-4" />
                
                <div className="relative w-full h-full bg-white rounded-[40px] shadow-2xl overflow-hidden flex flex-col items-center justify-center p-12">
                  <div className="absolute top-0 left-0 w-full h-2 bg-green" />
                  
                  <motion.img 
                    src="/dripswift.png" 
                    alt="Logo Dripswift" 
                    className="w-full h-auto mb-12"
                    animate={{ y: [0, -10, 0] }}
                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                  />
                  
                  <div className="text-center space-y-4">
                    <div className="h-[1px] w-12 bg-black/20 mx-auto" />
                    <p className="font-serif italic text-2xl text-black">Édition Limitée</p>
                    <p className="text-[10px] uppercase tracking-[0.3em] text-black/40 font-bold">Paris — 2024</p>
                  </div>
                </div>
              </motion.div>
            </div>

          </div>
        </div>
      </section>

      {/* 1. Brand Values - Immediate Reassurance */}
      <section className="py-16 md:py-24 border-b border-border/50 bg-card">
        <div className="container mx-auto px-6 md:px-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8">
            {[
              { icon: <Star size={18} strokeWidth={1.5} />, title: "L'Excellence", desc: "Maisons sélectionnées pour leur savoir-faire d'exception." },
              { icon: <Truck size={18} strokeWidth={1.5} />, title: "La Proximité", desc: "Un service de livraison premium au cœur de votre ville." },
              { icon: <ShieldCheck size={18} strokeWidth={1.5} />, title: "L'Authenticité", desc: "Traçabilité totale et transactions 100% sécurisées." },
            ].map((item, i) => (
              <motion.div key={item.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="flex flex-col items-center text-center space-y-4">
                <div className="text-green mb-2">{item.icon}</div>
                <h4 className="text-base md:text-lg font-black uppercase tracking-[0.35em] text-text-dark">{item.title}</h4>
                <p className="text-sm md:text-base text-text-light font-light italic max-w-[280px]">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 2. Featured Houses - Exclusive curation */}
      <section className="py-20 md:py-28 bg-background overflow-hidden">
        <div className="container mx-auto px-6 md:px-12">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-8">
            <div className="space-y-4">
              <span className="text-sm md:text-base text-green uppercase tracking-[0.45em] font-black italic">La Sélection</span>
              <h2 className="text-3xl md:text-4xl font-serif text-text-dark tracking-tight">Maisons de Prestige</h2>
              <div className="w-12 h-[1px] bg-green" />
            </div>
            <Link to="/shops" className="text-sm md:text-base font-bold uppercase tracking-[0.18em] text-text-light hover:text-green transition-colors border-b border-border pb-1">
              Voir toutes les maisons
            </Link>
          </div>

          {shopsLoading ? (
            <div className="py-20 flex justify-center"><LoadingSpinner /></div>
          ) : (
            <motion.div variants={stagger} initial="hidden" whileInView="visible" viewport={{ once: true }} className="grid grid-cols-1 md:grid-cols-3 gap-10">
              {featuredShops.map((shop, i) => (
                <motion.div key={shop.id} variants={fadeUp} custom={i}>
                  <ShopCard shop={shop} />
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </section>

      {/* 3. Signature Pieces - Trending items */}
      <section className="py-20 md:py-28 bg-card border-y border-border">
        <div className="container mx-auto px-6 md:px-12">
          <div className="text-center mb-16 space-y-4">
            <span className="text-sm md:text-base text-text-light uppercase tracking-[0.45em] font-bold">L'Art de Vivre</span>
            <h2 className="text-3xl md:text-4xl font-serif text-text-dark tracking-tight">Pièces Signatures</h2>
            <div className="w-12 h-[1px] bg-green mx-auto" />
          </div>

          {productsLoading ? (
            <div className="py-20 flex justify-center"><LoadingSpinner /></div>
          ) : (
            <motion.div variants={stagger} initial="hidden" whileInView="visible" viewport={{ once: true }} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {signatureProducts.map((product, i) => (
                <motion.div key={product.id} variants={fadeUp} custom={i}>
                  <Link to={`/product/${product.id}`} className="group block">
                    <div className="relative aspect-[4/5] overflow-hidden bg-white mb-4">
                      <img src={product.image} alt={product.name} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-200" />
                      <div className="absolute bottom-4 left-4">
                        <span className="bg-white/90 backdrop-blur-sm text-text-dark px-3 py-1.5 text-sm font-bold uppercase tracking-wider shadow-sm">
                          {product.price}€
                        </span>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] md:text-xs text-text-light uppercase tracking-[0.18em] font-medium">{product.category}</p>
                      <h3 className="text-sm md:text-base font-bold text-text-dark uppercase tracking-wider group-hover:text-green transition-colors">{product.name}</h3>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </motion.div>
          )}
          
          <div className="mt-16 text-center">
            <Link to="/catalogue" className="inline-block px-10 py-4 border border-border text-xs md:text-sm font-black uppercase tracking-[0.25em] hover:bg-text-dark hover:text-white transition-colors duration-200">
              Découvrir le catalogue
            </Link>
          </div>
        </div>
      </section>

      {/* 4. Premium Delivery - Luxury Service */}
      <section className="relative py-20 md:py-28 bg-background overflow-hidden border-y border-border">
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{ 
            backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(0,0,0,0.15) 1px, transparent 0)', 
            backgroundSize: '40px 40px' 
          }}></div>
        </div>

        <div className="container mx-auto px-6 md:px-12 relative z-10">
          <div className="text-center mb-16 space-y-4">
            <motion.span 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-xs md:text-sm text-green uppercase tracking-[0.45em] font-black italic"
            >
              Service Conciergerie
            </motion.span>
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-3xl md:text-4xl font-serif text-text-dark tracking-tight"
            >
              Livraison d'Exception
            </motion.h2>
            <motion.div 
              initial={{ width: 0 }}
              whileInView={{ width: 48 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="h-[1px] bg-green mx-auto"
            />
            <motion.p 
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="text-text-light italic text-[13px] max-w-xl mx-auto"
            >
              Un service de livraison premium où chaque détail compte
            </motion.p>
          </div>

          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12"
          >
            {[
              {
                icon: <Package size={20} strokeWidth={1.2} />,
                title: "Emballage Signature",
                desc: "Packaging luxueux avec ruban satin et carte manuscrite personnalisée"
              },
              {
                icon: <Clock size={20} strokeWidth={1.2} />,
                title: "Express Premium",
                desc: "Livraison en 2h dans les zones privilégiées, créneaux sur-mesure"
              },
              {
                icon: <Shield size={20} strokeWidth={1.2} />,
                title: "Assurance Totale",
                desc: "Protection intégrale de vos acquisitions jusqu'à votre domicile"
              },
              {
                icon: <Truck size={20} strokeWidth={1.2} />,
                title: "White Glove",
                desc: "Service concierge avec installation et débalnage par nos experts"
              }
            ].map((service, i) => (
              <motion.div
                key={service.title}
                variants={fadeUp}
                custom={i}
                className="group relative bg-white p-6 border border-border hover:border-green transition-colors duration-200"
              >
                <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-green/0 via-green to-green/0 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />
                
                <div className="flex flex-col items-start space-y-4">
                  <div className="text-green group-hover:scale-110 transition-transform duration-200">
                    {service.icon}
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-xs md:text-sm font-black uppercase tracking-[0.25em] text-text-dark">
                      {service.title}
                    </h3>
                    <p className="text-[12px] text-text-light leading-relaxed font-light">
                      {service.desc}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.5 }}
            className="text-center"
          >
            <div className="inline-block bg-card border border-border p-6 md:p-8">
              <div className="flex items-center gap-6 md:gap-12">
                <div className="text-left space-y-1">
                  <p className="text-[10px] md:text-xs text-text-light uppercase tracking-[0.3em] font-bold">
                    Livraison offerte
                  </p>
                  <p className="text-xl md:text-2xl font-serif text-text-dark">
                    Dès 150€ d'achat
                  </p>
                </div>
                <div className="w-px h-10 bg-border" />
                <div className="text-left space-y-1">
                  <p className="text-[10px] md:text-xs text-text-light uppercase tracking-[0.3em] font-bold">
                    Retours gratuits
                  </p>
                  <p className="text-xl md:text-2xl font-serif text-text-dark">
                    Sous 30 jours
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* 5. Merchant CTA - High Luxury Minimalist */}
      <section className="py-24 md:py-32 bg-background overflow-hidden">
        <div className="container mx-auto px-6 md:px-12">
          <div className="relative bg-stone-900 dark:bg-black min-h-[400px] flex items-center">
            <div className="absolute inset-0 opacity-20 dark:opacity-10">
              <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.05) 1px, transparent 0)', backgroundSize: '40px 40px' }}></div>
              <motion.div animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.3, 0.1] }} transition={{ duration: 10, repeat: Infinity, ease: "linear" }} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-green/20 dark:bg-green/10 rounded-full blur-[100px]" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-5 w-full relative z-10">
              <div className="lg:col-span-3 p-10 md:p-20 space-y-8 text-left">
                <div className="space-y-4">
                  <span className="text-xs md:text-sm text-green uppercase tracking-[0.5em] font-black">Partenariat Privé</span>
                  <h3 className="text-3xl md:text-4xl font-serif text-white leading-tight tracking-tight">
                    Votre Maison, <br />
                    <span className="italic font-light opacity-90 dark:opacity-80">notre écrin digital.</span>
                  </h3>
                </div>
                <div className="flex flex-col sm:flex-row gap-6 pt-4">
                  <Link to="/merchant/register" className="group relative px-10 py-4 bg-white dark:bg-zinc-900 text-black dark:text-white text-xs md:text-sm font-black uppercase tracking-[0.25em] overflow-hidden transition-colors duration-200 text-center">
                    <span className="relative z-10 text-black dark:text-white group-hover:text-white dark:group-hover:text-white transition-colors duration-200">Devenir Partenaire</span>
                    <div className="absolute inset-0 bg-green translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                  </Link>
                  <Link to="/merchant/login" className="px-10 py-4 border border-white/20 dark:border-white/30 text-white text-xs md:text-sm font-black uppercase tracking-[0.25em] hover:bg-white dark:hover:bg-white hover:text-text-dark dark:hover:text-black transition-colors duration-200 text-center">
                    Espace Créateur
                  </Link>
                </div>
              </div>
              <div className="hidden lg:flex lg:col-span-2 items-center justify-center border-l border-white/5 dark:border-text-dark/20 bg-white/5 dark:bg-text-dark/5 backdrop-blur-sm p-10">
                <div className="text-center space-y-10">
                  {[
                    { label: "Commission", value: "08%" },
                    { label: "Visibilité", value: "100k+" },
                    { label: "Support", value: "24/7" },
                  ].map((stat, i) => (
                    <motion.div key={stat.label} initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: 0.3 + (i * 0.1) }} className="space-y-1">
                      <div className="text-3xl font-serif text-white dark:text-text-dark">{stat.value}</div>
                      <div className="text-[10px] md:text-xs text-green uppercase tracking-[0.3em] font-bold">{stat.label}</div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;

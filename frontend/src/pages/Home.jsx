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

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative h-[85vh] overflow-hidden">
        <div className="absolute inset-0">
          <img src={heroImage} alt="Shop In Line" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-black/30" />
        </div>

        <div className="relative z-10 container mx-auto px-6 md:px-12 h-full flex items-center">
          <motion.div initial="hidden" animate="visible" variants={stagger} className="max-w-2xl">
            <motion.div variants={fadeUp} custom={0} className="mb-6">
              <span className="text-white/90 text-[10px] font-bold tracking-[0.4em] uppercase">LocalStyle — La Sélection</span>
            </motion.div>
            <motion.h1 variants={fadeUp} custom={1} className="text-5xl md:text-7xl font-serif text-white leading-tight mb-8">
              L'élégance locale, <br />
              <span className="italic text-white/90 font-light">réinventée.</span>
            </motion.h1>
            <motion.div variants={fadeUp} custom={2} className="flex gap-6 items-center">
              <Link to="/shops" className="bg-white text-text-dark px-10 py-4 text-[11px] font-bold uppercase tracking-[0.2em] hover:bg-green hover:text-white transition-all duration-500 shadow-sm">
                Explorer l'écosystème
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* 1. Brand Values - Immediate Reassurance */}
      <section className="py-24 border-b border-border/50 bg-card">
        <div className="container mx-auto px-6 md:px-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-16 md:gap-8">
            {[
              { icon: <Star size={18} strokeWidth={1.5} />, title: "L'Excellence", desc: "Maisons sélectionnées pour leur savoir-faire d'exception." },
              { icon: <Truck size={18} strokeWidth={1.5} />, title: "La Proximité", desc: "Un service de livraison premium au cœur de votre ville." },
              { icon: <ShieldCheck size={18} strokeWidth={1.5} />, title: "L'Authenticité", desc: "Traçabilité totale et transactions 100% sécurisées." },
            ].map((item, i) => (
              <motion.div key={item.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="flex flex-col items-center text-center space-y-4">
                <div className="text-green mb-2">{item.icon}</div>
                <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-text-dark">{item.title}</h4>
                <p className="text-[12px] text-text-light font-light italic max-w-[200px]">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 2. Featured Houses - Exclusive curation */}
      <section className="py-32 bg-background overflow-hidden">
        <div className="container mx-auto px-6 md:px-12">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-20 gap-8">
            <div className="space-y-4">
              <span className="text-[10px] text-green uppercase tracking-[0.5em] font-black italic">La Sélection</span>
              <h2 className="text-4xl md:text-5xl font-serif text-text-dark tracking-tight">Maisons de Prestige</h2>
              <div className="w-12 h-[1px] bg-green" />
            </div>
            <Link to="/shops" className="text-[10px] font-bold uppercase tracking-[0.2em] text-text-light hover:text-green transition-colors border-b border-border pb-1">
              Voir toutes les maisons
            </Link>
          </div>

          {shopsLoading ? (
            <div className="py-20 flex justify-center"><LoadingSpinner /></div>
          ) : (
            <motion.div variants={stagger} initial="hidden" whileInView="visible" viewport={{ once: true }} className="grid grid-cols-1 md:grid-cols-3 gap-12">
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
      <section className="py-32 bg-card border-y border-border">
        <div className="container mx-auto px-6 md:px-12">
          <div className="text-center mb-20 space-y-4">
            <span className="text-[10px] text-text-light uppercase tracking-[0.5em] font-bold">L'Art de Vivre</span>
            <h2 className="text-4xl font-serif text-text-dark tracking-tight">Pièces Signatures</h2>
            <div className="w-12 h-[1px] bg-green mx-auto" />
          </div>

          {productsLoading ? (
            <div className="py-20 flex justify-center"><LoadingSpinner /></div>
          ) : (
            <motion.div variants={stagger} initial="hidden" whileInView="visible" viewport={{ once: true }} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {signatureProducts.map((product, i) => (
                <motion.div key={product.id} variants={fadeUp} custom={i}>
                  <Link to={`/product/${product.id}`} className="group block">
                    <div className="relative aspect-[4/5] overflow-hidden bg-white mb-6">
                      <img src={product.image} alt={product.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-500" />
                      <div className="absolute bottom-4 left-4">
                        <span className="bg-white/90 backdrop-blur-sm text-text-dark px-4 py-2 text-[10px] font-bold uppercase tracking-widest shadow-sm">
                          {product.price}€
                        </span>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[9px] text-text-light uppercase tracking-[0.2em] font-medium">{product.category}</p>
                      <h3 className="text-[12px] font-bold text-text-dark uppercase tracking-wider group-hover:text-green transition-colors">{product.name}</h3>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </motion.div>
          )}
          
          <div className="mt-20 text-center">
            <Link to="/catalogue" className="inline-block px-12 py-5 border border-border text-[11px] font-black uppercase tracking-[0.3em] hover:bg-text-dark hover:text-white transition-all duration-500">
              Découvrir le catalogue
            </Link>
          </div>
        </div>
      </section>

      {/* 4. Premium Delivery - Luxury Service */}
      <section className="relative py-32 bg-background overflow-hidden border-y border-border">
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{ 
            backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(0,0,0,0.15) 1px, transparent 0)', 
            backgroundSize: '40px 40px' 
          }}></div>
        </div>

        <div className="container mx-auto px-6 md:px-12 relative z-10">
          <div className="text-center mb-20 space-y-4">
            <motion.span 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-[10px] text-green uppercase tracking-[0.5em] font-black italic"
            >
              Service Conciergerie
            </motion.span>
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-4xl md:text-5xl font-serif text-text-dark tracking-tight"
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
              className="text-text-light italic text-sm max-w-xl mx-auto"
            >
              Un service de livraison premium où chaque détail compte
            </motion.p>
          </div>

          <motion.div 
            variants={stagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16"
          >
            {[
              {
                icon: <Package size={24} strokeWidth={1.2} />,
                title: "Emballage Signature",
                desc: "Packaging luxueux avec ruban satin et carte manuscrite personnalisée"
              },
              {
                icon: <Clock size={24} strokeWidth={1.2} />,
                title: "Express Premium",
                desc: "Livraison en 2h dans les zones privilégiées, créneaux sur-mesure"
              },
              {
                icon: <Shield size={24} strokeWidth={1.2} />,
                title: "Assurance Totale",
                desc: "Protection intégrale de vos acquisitions jusqu'à votre domicile"
              },
              {
                icon: <Truck size={24} strokeWidth={1.2} />,
                title: "White Glove",
                desc: "Service concierge avec installation et débalnage par nos experts"
              }
            ].map((service, i) => (
              <motion.div
                key={service.title}
                variants={fadeUp}
                custom={i}
                className="group relative bg-white p-8 border border-border hover:border-green transition-all duration-500"
              >
                <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-green/0 via-green to-green/0 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-700" />
                
                <div className="flex flex-col items-start space-y-6">
                  <div className="text-green group-hover:scale-110 transition-transform duration-500">
                    {service.icon}
                  </div>
                  <div className="space-y-3">
                    <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-text-dark">
                      {service.title}
                    </h3>
                    <p className="text-[13px] text-text-light leading-relaxed font-light">
                      {service.desc}
                    </p>
                  </div>
                </div>

                <div className="absolute bottom-0 right-0 w-24 h-24 bg-green/5 rounded-tl-full transform translate-x-12 translate-y-12 group-hover:translate-x-8 group-hover:translate-y-8 transition-transform duration-700" />
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
            <div className="inline-block bg-card border border-border p-8">
              <div className="flex items-center gap-8">
                <div className="text-left space-y-2">
                  <p className="text-[9px] text-text-light uppercase tracking-[0.4em] font-bold">
                    Livraison offerte
                  </p>
                  <p className="text-2xl font-serif text-text-dark">
                    Dès 150€ d'achat
                  </p>
                </div>
                <div className="w-px h-12 bg-border" />
                <div className="text-left space-y-2">
                  <p className="text-[9px] text-text-light uppercase tracking-[0.4em] font-bold">
                    Retours gratuits
                  </p>
                  <p className="text-2xl font-serif text-text-dark">
                    Sous 30 jours
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* 5. Merchant CTA - High Luxury Minimalist */}
      <section className="py-40 bg-background overflow-hidden">
        <div className="container mx-auto px-6 md:px-12">
          <div className="relative bg-text-dark min-h-[500px] flex items-center">
            <div className="absolute inset-0 opacity-20">
              <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.05) 1px, transparent 0)', backgroundSize: '40px 40px' }}></div>
              <motion.div animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.3, 0.1] }} transition={{ duration: 10, repeat: Infinity, ease: "linear" }} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-green/20 rounded-full blur-[120px]" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-5 w-full relative z-10">
              <div className="lg:col-span-3 p-12 md:p-24 space-y-10 text-left">
                <div className="space-y-4">
                  <span className="text-[10px] text-green uppercase tracking-[0.6em] font-black">Partenariat Privé</span>
                  <h3 className="text-4xl md:text-5xl font-serif text-white leading-tight tracking-tight">
                    Votre Maison, <br />
                    <span className="italic font-light opacity-90">notre écrin digital.</span>
                  </h3>
                </div>
                <div className="flex flex-col sm:flex-row gap-8 pt-6">
                  <Link to="/merchant/register" className="group relative px-12 py-5 bg-white text-text-dark text-[11px] font-black uppercase tracking-[0.3em] overflow-hidden transition-all duration-500 text-center">
                    <span className="relative z-10 group-hover:text-white transition-colors duration-500">Devenir Partenaire</span>
                    <div className="absolute inset-0 bg-green translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
                  </Link>
                  <Link to="/merchant/login" className="px-12 py-5 border border-white/20 text-white text-[11px] font-black uppercase tracking-[0.3em] hover:bg-white hover:text-text-dark transition-all duration-500 text-center">
                    Espace Créateur
                  </Link>
                </div>
              </div>
              <div className="hidden lg:flex lg:col-span-2 items-center justify-center border-l border-white/5 bg-white/5 backdrop-blur-sm p-12">
                <div className="text-center space-y-12">
                  {[
                    { label: "Commission", value: "08%" },
                    { label: "Visibilité", value: "100k+" },
                    { label: "Support", value: "24/7" },
                  ].map((stat, i) => (
                    <motion.div key={stat.label} initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: 0.3 + (i * 0.1) }} className="space-y-1">
                      <div className="text-4xl font-serif text-white">{stat.value}</div>
                      <div className="text-[9px] text-green uppercase tracking-[0.4em] font-bold">{stat.label}</div>
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

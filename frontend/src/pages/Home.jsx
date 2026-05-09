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
    <div className="min-h-screen bg-[#FDFCFB]">
      {/* Afficher un message de chargement plus discret si authLoading est vrai */}
      {authLoading && <div className="fixed top-0 left-0 w-full h-1 bg-black/5 animate-pulse z-[9999]" />}
      
      {/* New Reinvented Hero - Light Luxury Minimalism */}
      <section className="relative min-h-[70vh] flex items-center bg-[#FDFCFB] overflow-hidden border-b border-neutral-light">
        {/* Abstract Background Elements - Subtle Warm Glows */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-[#F5F3EF] blur-[120px] rounded-full opacity-60" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-[#EAE8E4] blur-[120px] rounded-full opacity-40" />
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
                <div className="mb-8 overflow-hidden">
                  <motion.span 
                    initial={{ y: "100%" }}
                    animate={{ y: 0 }}
                    transition={{ delay: 0.2, duration: 0.5 }}
                    className="inline-block text-[#8C867E] font-black tracking-[0.6em] uppercase text-xs md:text-sm"
                  >
                    L'Excellence à votre porte
                  </motion.span>
                </div>
                
                <h1 className="text-7xl md:text-8xl lg:text-[10rem] font-serif text-text-dark leading-[0.85] tracking-tighter mb-10">
                  Drip <br />
                  <span className="italic font-light text-[#A69F95]">Swift.</span>
                </h1>
                
                <p className="text-text-medium text-xl md:text-2xl max-w-xl mb-14 font-light leading-relaxed">
                  Plus qu'une livraison, une signature. Découvrez les boutiques les plus prestigieuses de votre ville, livrées avec une élégance absolue.
                </p>
                
                <div className="flex flex-col sm:flex-row gap-8">
                  <Link to="/shops" className="group relative bg-text-dark text-white px-12 py-6 text-sm font-black uppercase tracking-[0.3em] overflow-hidden transition-all duration-300 shadow-xl shadow-black/5">
                    <span className="relative z-10">Explorer l'Excellence</span>
                    <div className="absolute inset-0 bg-black translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                  </Link>
                  <Link to="/catalogue" className="px-12 py-6 text-sm font-black uppercase tracking-[0.3em] border border-neutral-light text-text-dark hover:border-text-dark transition-colors duration-300">
                    Voir le catalogue
                  </Link>
                </div>
              </motion.div>
            </div>

            {/* Right side: Modern Visual Element */}
            <div className="lg:col-span-5 relative hidden lg:block">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 1, ease: "easeOut" }}
                className="relative aspect-[4/5] flex items-center justify-center"
              >
                {/* Logo Floating in a Premium Frame */}
                <div className="absolute inset-0 border border-[#EAE8E4] rounded-[40px] rotate-3 translate-x-6" />
                <div className="absolute inset-0 border border-[#F5F3EF] rounded-[40px] -rotate-3 -translate-x-6" />
                
                <div className="relative w-full h-full bg-white rounded-[40px] shadow-[0_40px_80px_rgba(0,0,0,0.03)] overflow-hidden flex flex-col items-center justify-center p-16 border border-[#F5F3EF]">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#D4D1CC] to-transparent" />
                  
                  <motion.img 
                    src="/dripswift.png" 
                    alt="Logo Dripswift" 
                    className="w-full h-auto mb-16 mix-blend-multiply"
                    animate={{ y: [0, -15, 0] }}
                    transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                  />
                  
                  <div className="text-center space-y-6">
                    <div className="h-[1px] w-20 bg-[#EAE8E4] mx-auto" />
                    <div className="space-y-3">
                      <p className="font-serif italic text-4xl text-text-dark tracking-wide">Édition Limitée</p>
                      <p className="text-[12px] uppercase tracking-[0.5em] text-[#A69F95] font-black">Collection Privée 2024</p>
                    </div>
                    <div className="h-[1px] w-20 bg-[#EAE8E4] mx-auto" />
                  </div>
                </div>
              </motion.div>
            </div>

          </div>
        </div>
      </section>

      {/* 1. Brand Values - Immediate Reassurance */}
      <section className="py-24 md:py-32 border-b border-border/50 bg-white">
        <div className="container mx-auto px-6 md:px-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-16 md:gap-12">
            {[
              { icon: <Star size={20} strokeWidth={1} />, title: "L'Excellence", desc: "Maisons sélectionnées pour leur savoir-faire d'exception." },
              { icon: <Truck size={20} strokeWidth={1} />, title: "La Proximité", desc: "Un service de livraison premium au cœur de votre ville." },
              { icon: <ShieldCheck size={20} strokeWidth={1} />, title: "L'Authenticité", desc: "Traçabilité totale et transactions 100% sécurisées." },
            ].map((item, i) => (
              <motion.div key={item.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="flex flex-col items-center text-center space-y-6">
                <div className="text-[#8C867E] p-4 bg-[#FDFCFB] rounded-full">{item.icon}</div>
                <h4 className="text-sm md:text-base font-black uppercase tracking-[0.4em] text-text-dark">{item.title}</h4>
                <p className="text-base text-text-medium font-light italic max-w-[280px] leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 2. Featured Houses - Exclusive curation */}
      <section className="py-28 md:py-40 bg-[#FDFCFB] overflow-hidden">
        <div className="container mx-auto px-6 md:px-12">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-20 gap-10">
            <div className="space-y-6">
              <span className="text-xs md:text-sm text-[#A69F95] uppercase tracking-[0.6em] font-black">La Sélection</span>
              <h2 className="text-4xl md:text-6xl font-serif text-text-dark tracking-tight leading-tight">Maisons de <br/>Prestige</h2>
            </div>
            <Link to="/shops" className="text-sm font-black uppercase tracking-[0.3em] text-text-medium hover:text-text-dark transition-all border-b-2 border-neutral-light pb-2 hover:border-text-dark">
              Explorer tout l'univers
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
      <section className="py-28 md:py-40 bg-white border-y border-border">
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
          
          <div className="mt-20 text-center">
            <Link to="/catalogue" className="inline-block px-12 py-5 border border-border text-xs md:text-sm font-black uppercase tracking-[0.3em] hover:bg-text-dark hover:text-white transition-all duration-300">
              Découvrir le catalogue
            </Link>
          </div>
        </div>
      </section>

      {/* 4. Premium Delivery - Luxury Service */}
      <section className="relative py-28 md:py-40 bg-[#FDFCFB] overflow-hidden border-b border-border">
        <div className="absolute inset-0 opacity-20 pointer-events-none">
          <div className="absolute inset-0" style={{ 
            backgroundImage: 'radial-gradient(circle at 2px 2px, #D4D1CC 1px, transparent 0)', 
            backgroundSize: '48px 48px' 
          }}></div>
        </div>

        <div className="container mx-auto px-6 md:px-12 relative z-10">
          <div className="text-center mb-24 space-y-6">
            <motion.span 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-xs md:text-sm text-text-dark uppercase tracking-[0.6em] font-black italic"
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
              whileInView={{ width: 64 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2, duration: 0.8 }}
              className="h-[1px] bg-text-dark mx-auto"
            />
          </div>

          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-20"
          >
            {[
              {
                icon: <Package size={24} strokeWidth={1} />,
                title: "Emballage Signature",
                desc: "Packaging luxueux avec ruban satin et carte manuscrite personnalisée"
              },
              {
                icon: <Clock size={24} strokeWidth={1} />,
                title: "Express Premium",
                desc: "Livraison en 2h dans les zones privilégiées, créneaux sur-mesure"
              },
              {
                icon: <Shield size={24} strokeWidth={1} />,
                title: "Assurance Totale",
                desc: "Protection intégrale de vos acquisitions jusqu'à votre domicile"
              },
              {
                icon: <Truck size={24} strokeWidth={1} />,
                title: "White Glove",
                desc: "Service concierge avec installation et déballage par nos experts"
              }
            ].map((service, i) => (
              <motion.div
                key={service.title}
                variants={fadeUp}
                custom={i}
                className="group relative bg-white p-8 border border-[#EAE8E4] hover:border-text-dark transition-all duration-300"
              >
                <div className="absolute top-0 left-0 w-full h-[1px] bg-text-dark transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500" />
                
                <div className="flex flex-col items-start space-y-6">
                  <div className="text-[#8C867E] group-hover:scale-110 transition-transform duration-300">
                    {service.icon}
                  </div>
                  <div className="space-y-4">
                    <h3 className="text-sm font-black uppercase tracking-[0.3em] text-text-dark">
                      {service.title}
                    </h3>
                    <p className="text-sm text-text-medium leading-relaxed font-light italic">
                      {service.desc}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.5 }}
            className="text-center"
          >
            <div className="inline-block bg-white border border-[#EAE8E4] p-10 md:p-14 shadow-sm">
              <div className="flex flex-col md:flex-row items-center gap-10 md:gap-20">
                <div className="text-center md:text-left space-y-2">
                  <p className="text-xs text-[#A69F95] uppercase tracking-[0.4em] font-black">
                    Livraison offerte
                  </p>
                  <p className="text-2xl md:text-3xl font-serif text-text-dark">
                    Dès 150€ d'achat
                  </p>
                </div>
                <div className="hidden md:block w-[1px] h-12 bg-[#EAE8E4]" />
                <div className="text-center md:text-left space-y-2">
                  <p className="text-xs text-[#A69F95] uppercase tracking-[0.4em] font-black">
                    Retours gratuits
                  </p>
                  <p className="text-2xl md:text-3xl font-serif text-text-dark">
                    Sous 30 jours
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* 5. Merchant CTA - High Luxury Minimalist */}
      <section className="py-28 md:py-40 bg-white">
        <div className="container mx-auto px-6 md:px-12">
          <div className="relative bg-[#1C1917] min-h-[500px] flex items-center overflow-hidden">
            {/* Artistic overlays */}
            <div className="absolute inset-0 opacity-30">
              <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-white/5 rounded-full blur-[120px] -mr-96 -mt-96" />
              <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-white/5 rounded-full blur-[100px] -ml-48 -mb-48" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-5 w-full relative z-10">
              <div className="lg:col-span-3 p-12 md:p-24 space-y-10 text-left">
                <div className="space-y-6">
                  <span className="text-xs md:text-sm text-white/40 uppercase tracking-[0.6em] font-black">Partenariat Privé</span>
                  <h3 className="text-4xl md:text-6xl font-serif text-white leading-[1.1] tracking-tight">
                    Votre Maison, <br />
                    <span className="italic font-light opacity-80">notre écrin digital.</span>
                  </h3>
                </div>
                <div className="flex flex-col sm:flex-row gap-8 pt-6">
                  <Link to="/merchant/register" className="group relative px-12 py-5 bg-white text-black text-sm font-black uppercase tracking-[0.3em] overflow-hidden transition-all duration-500 text-center">
                    <span className="relative z-10 group-hover:text-white transition-colors duration-300">Devenir Partenaire</span>
                    <div className="absolute inset-0 bg-black translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
                  </Link>
                  <Link to="/merchant/login" className="px-12 py-5 border border-white/20 text-white text-sm font-black uppercase tracking-[0.3em] hover:bg-white hover:text-black transition-all duration-300 text-center">
                    Espace Créateur
                  </Link>
                </div>
              </div>
              <div className="hidden lg:flex lg:col-span-2 items-center justify-center border-l border-white/5 bg-white/2 backdrop-blur-sm p-12">
                <div className="text-center space-y-12">
                  {[
                    { label: "Commission", value: "08%" },
                    { label: "Visibilité", value: "100k+" },
                    { label: "Support", value: "24/7" },
                  ].map((stat, i) => (
                    <motion.div key={stat.label} initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: 0.3 + (i * 0.1) }} className="space-y-2">
                      <div className="text-4xl font-serif text-white">{stat.value}</div>
                      <div className="text-[11px] text-white/40 uppercase tracking-[0.4em] font-black">{stat.label}</div>
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

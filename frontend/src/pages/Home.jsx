import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useShops } from '../hooks/useShops';
import { useProducts } from '../hooks/useProduct';
import LoadingSpinner from '../components/LoadingSpinner';
import { motion } from 'framer-motion';
import sajaLogo from '/saja.png';
import { Truck, ArrowRight, Package, Clock, Shield, Search, Star, Zap, Flame } from 'lucide-react';
import ShopCard from '../components/ShopCard';
import ConciergeServices from '../components/ConciergeServices';

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
  const { shops, loading: shopsLoading } = useShops();
  const { products, loading: productsLoading } = useProducts();

  const featuredShops = shops ? shops.slice(0, 3) : [];
  const signatureProducts = products ? products.slice(0, 4) : [];

  return (
    <div className="min-h-screen bg-[#FDFCFB]">
      {authLoading && <div className="fixed top-0 left-0 w-full h-1 bg-black/5 animate-pulse z-[9999]" />}
      
      {/* 1. HERO SECTION */}
      <section className="relative min-h-[calc(100vh-80px)] md:min-h-[650px] flex items-center overflow-hidden bg-[#FDFCFB] pt-20 pb-20 lg:pt-32 lg:pb-32">
        <div className="absolute top-20 right-[-10%] w-[300px] md:w-[500px] h-[300px] md:h-[500px] bg-[#F5F3EF] rounded-full blur-[80px] md:blur-[120px] pointer-events-none opacity-50" />
        <div className="absolute bottom-[-10%] left-[-5%] w-[250px] md:w-[400px] h-[250px] md:h-[400px] bg-[#EAE8E4] rounded-full blur-[70px] md:blur-[100px] pointer-events-none opacity-30" />
        
        <div className="container mx-auto px-6 md:px-12 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            
            <motion.div initial="hidden" animate="visible" variants={stagger} className="lg:col-span-8 space-y-8 md:space-y-12">
              <motion.div variants={fadeUp} custom={0}>
                <div className="flex items-center gap-4 mb-6 md:mb-8">
                  <div className="w-12 h-[1px] bg-[#A69F95]" />
                  <span className="text-[10px] md:text-[11px] tracking-[0.5em] md:tracking-[0.8em] uppercase font-black text-[#A69F95]">
                    Maison de Prestige
                  </span>
                </div>
                <h1 className="text-7xl sm:text-8xl md:text-9xl lg:text-[150px] font-serif leading-[0.85] text-text-dark tracking-tighter relative">
                  SAJA
                  <motion.span 
                    initial={{ width: 0 }}
                    animate={{ width: '100px' }}
                    transition={{ delay: 0.8, duration: 1 }}
                    className="absolute -bottom-4 left-0 h-[2px] bg-black hidden lg:block"
                  />
                </h1>
                <div className="mt-6 md:mt-10">
                  <h2 className="text-3xl md:text-5xl font-serif italic font-light text-[#A69F95] leading-tight">
                    L'excellence,<br />
                    <span className="sm:pl-20">sans attente.</span>
                  </h2>
                </div>
              </motion.div>

              <motion.p variants={fadeUp} custom={1} className="text-base md:text-xl text-text-medium font-light leading-relaxed max-w-xl italic">
                Une curation exclusive de pièces d'exception, livrées avec une précision absolue. L'art de vivre réinventé pour l'élite contemporaine.
              </motion.p>

              <motion.div variants={fadeUp} custom={2} className="flex flex-col sm:flex-row gap-8 items-stretch sm:items-center pt-8">
                <Link to="/shops" className="group relative inline-block bg-black text-white px-10 md:px-16 py-5 md:py-6 text-[10px] md:text-[11px] uppercase tracking-[0.4em] font-black overflow-hidden transition-all duration-500 text-center">
                  <span className="relative z-10 group-hover:text-black transition-colors duration-500">Explorer l'univers</span>
                  <div className="absolute inset-0 bg-white translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
                </Link>
                <Link to="/catalogue" className="group flex items-center justify-center sm:justify-start gap-4 text-[10px] md:text-[11px] uppercase tracking-[0.4em] font-black text-text-dark hover:text-[#A69F95] transition-colors">
                  <span>Le Catalogue</span>
                  <div className="w-8 h-[1px] bg-text-dark group-hover:w-12 transition-all" />
                  <ArrowRight size={16} className="group-hover:translate-x-2 transition-transform" />
                </Link>
              </motion.div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }} 
              animate={{ opacity: 1, scale: 1 }} 
              transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }} 
              className="lg:col-span-4 relative mt-16 lg:mt-0"
            >
              <div className="relative z-10 w-full max-w-[400px] lg:max-w-[450px] mx-auto lg:ml-auto">
                <div className="aspect-square bg-white flex items-center justify-center shadow-[0_40px_100px_-20px_rgba(0,0,0,0.15)] border-[1px] border-[#EAE8E4] relative group overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-[#FDFCFB] to-[#F5F3EF]" />
                  <div className="absolute top-0 left-0 w-full h-full border-[20px] border-white z-20 pointer-events-none" />
                  <motion.img 
                    initial={{ scale: 0.8, opacity: 0 }} 
                    animate={{ scale: 1, opacity: 1 }} 
                    transition={{ duration: 1.5, ease: "easeOut" }} 
                    src={sajaLogo} 
                    alt="SAJA Seal" 
                    className="relative z-10 w-3/4 h-auto mix-blend-multiply transition-transform duration-1000 group-hover:scale-110 grayscale-[0.2] group-hover:grayscale-0" 
                  />
                  <div className="absolute bottom-8 right-8 z-30 opacity-20 group-hover:opacity-100 transition-opacity">
                    <span className="text-[10px] font-black uppercase tracking-[0.4em]">Est. 2026</span>
                  </div>
                </div>
                <div className="absolute -top-12 -left-12 w-32 h-32 border border-[#EAE8E4] -z-10 rounded-full" />
                <div className="absolute -bottom-8 -right-8 w-48 h-48 bg-[#F5F3EF] -z-10 rounded-full blur-3xl opacity-50" />
              </div>
            </motion.div>
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
                      <img 
                        src={product.image} 
                        alt={product.name} 
                        loading="lazy"
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
                      />
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
      <section className="relative py-16 md:py-24 bg-[#FDFCFB] overflow-hidden border-b border-border">
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

          <div className="mt-12">
            <ConciergeServices showTitle={false} isOverview={true} />
          </div>
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

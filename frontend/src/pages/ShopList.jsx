import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useShops } from '../hooks/useShops';
import LoadingSpinner from '../components/LoadingSpinner';
import { motion } from 'framer-motion';
import { Search } from 'lucide-react';
import heroImage from '/localstyle.png';

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.6 },
  }),
};

const stagger = {
  visible: { transition: { staggerChildren: 0.08 } },
};

const ShopList = () => {
  const { shops, loading, error } = useShops();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <motion.div className="text-center">
          <div className="text-5xl mb-4">😔</div>
          <h2 className="text-2xl font-bold text-text-dark mb-4">Erreur</h2>
          <p className="text-text-medium">{error}</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pt-32 pb-24">
      {/* Header Section */}
      <section className="container mx-auto px-6 md:px-12">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={stagger}
          className="max-w-3xl mx-auto text-center mb-24"
        >
          <motion.div variants={fadeUp} custom={0} className="mb-6">
            <span className="text-text-light text-[10px] font-bold tracking-[0.4em] uppercase">Partenaires</span>
          </motion.div>
          <motion.h1 variants={fadeUp} custom={1} className="text-4xl md:text-5xl font-serif text-text-dark mb-6">
            L'Écosystème Local
          </motion.h1>
          <motion.div variants={fadeUp} className="w-12 h-[1px] bg-green mx-auto mb-8" />
          <motion.p variants={fadeUp} custom={2} className="text-[13px] uppercase tracking-widest text-text-medium max-w-lg mx-auto leading-relaxed font-medium">
            Découvrez les maisons indépendantes sélectionnées pour leur excellence et leur savoir-faire unique.
          </motion.p>
        </motion.div>

        {/* Shops Grid */}
        {shops && shops.length > 0 ? (
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={stagger}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-20"
          >
            {shops.map((shop, i) => (
              <motion.div key={shop.id} variants={fadeUp} custom={i}>
                <Link to={`/shop/${shop.id}`} className="group block">
                  <div className="relative aspect-[16/10] overflow-hidden bg-white mb-8 shadow-sm">
                    <img
                      src={shop.image || heroImage}
                      alt={shop.name}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-500" />
                    <div className="absolute top-4 left-4">
                       <span className="bg-white/90 backdrop-blur-sm px-4 py-2 text-[9px] font-bold uppercase tracking-widest text-text-dark shadow-sm">
                         {shop.category}
                       </span>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <h3 className="text-xl font-serif text-text-dark group-hover:text-green transition-colors duration-300">
                      {shop.name}
                    </h3>
                    <div className="flex items-center justify-between">
                      <p className="text-[10px] text-text-light uppercase tracking-[0.2em] font-bold">
                         📍 {shop.distance ? `${shop.distance} km` : 'Local'}
                      </p>
                      <span className="text-[10px] text-green uppercase font-bold tracking-widest opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        Visiter la boutique
                      </span>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-32 border border-dashed border-border"
          >
             <p className="text-[11px] uppercase tracking-widest text-text-light">Aucune boutique disponible pour le moment.</p>
          </motion.div>
        )}
      </section>
    </div>
  );
};

export default ShopList;

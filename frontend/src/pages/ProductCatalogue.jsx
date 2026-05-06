import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useProducts } from '../hooks/useProduct';
import LoadingSpinner from '../components/LoadingSpinner';
import { motion } from 'framer-motion';
import { Search } from 'lucide-react';

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

const ProductCatalogue = () => {
  const { products, loading } = useProducts();

  const categories = [
    { emoji: "👟", name: "Chaussures" },
    { emoji: "👕", name: "Vêtements" },
    { emoji: "💎", name: "Accessoires" },
    { emoji: "🕶️", name: "Mixte" },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pt-40 pb-32">
      {/* Header Section */}
      <section className="max-w-[1600px] mx-auto px-8 md:px-12">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={stagger}
          className="max-w-4xl mx-auto text-center mb-32"
        >
          <motion.div variants={fadeUp} custom={0} className="mb-8">
            <span className="text-text-light text-sm font-black tracking-[0.5em] uppercase">Collections de prestige</span>
          </motion.div>
          <motion.h1 variants={fadeUp} custom={1} className="text-5xl md:text-7xl font-serif text-text-dark mb-10 tracking-tight">
            Le Catalogue
          </motion.h1>
          <motion.div variants={fadeUp} className="w-20 h-[2px] bg-green mx-auto mb-12" />
          <motion.p variants={fadeUp} custom={2} className="text-base uppercase tracking-[0.25em] text-text-medium max-w-2xl mx-auto leading-loose font-medium">
            Une sélection rigoureuse de pièces d'exception issues des meilleures boutiques locales.
          </motion.p>
        </motion.div>

        {/* Products Grid */}
        {products && products.length > 0 ? (
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={stagger}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-12 gap-y-24"
          >
            {products.map((product, i) => (
              <motion.div key={product.id} variants={fadeUp} custom={i}>
                <Link to={`/product/${product.id}`} className="group block">
                  <div className="relative aspect-[3/4] overflow-hidden bg-white mb-8 shadow-sm group-hover:shadow-2xl transition-all duration-700">
                    <img
                      src={product.image || 'https://via.placeholder.com/600x800?text=Produit'}
                      alt={product.name}
                      className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-700" />
                    
                    {product.price && (
                      <div className="absolute bottom-6 left-6">
                        <span className="bg-white/95 backdrop-blur-md text-text-dark px-6 py-3 text-sm font-black uppercase tracking-[0.3em] shadow-xl">
                          {product.price}€
                        </span>
                      </div>
                    )}
                  </div>
                  
                  <div className="space-y-3 px-2">
                    <p className="text-xs text-text-light uppercase tracking-[0.3em] font-black">
                      {product.category}
                    </p>
                    <h3 className="text-lg font-bold text-text-dark uppercase tracking-widest group-hover:text-green transition-colors duration-500">
                      {product.name}
                    </h3>
                    <div className="flex items-center gap-4 pt-3 border-t border-transparent group-hover:border-slate-100 transition-colors">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-text-medium tracking-[0.2em] font-bold">4.8 / 5.0</span>
                      </div>
                      <span className="w-8 h-[1px] bg-border group-hover:bg-green transition-colors"></span>
                      <span className="text-xs text-green uppercase font-black tracking-[0.3em] opacity-0 group-hover:opacity-100 transition-all duration-500 translate-x-[-10px] group-hover:translate-x-0">
                        Voir
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
            className="text-center py-40 border-2 border-dashed border-slate-100 rounded-[3rem]"
          >
            <h3 className="text-3xl font-serif text-text-dark mb-6">Aucune pièce disponible</h3>
            <p className="text-sm uppercase tracking-[0.4em] text-text-light font-bold">
              Notre collection est en cours de renouvellement.
            </p>
          </motion.div>
        )}
      </section>
    </div>
  );
};

export default ProductCatalogue;

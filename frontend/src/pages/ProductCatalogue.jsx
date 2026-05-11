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
    <div className="min-h-screen bg-background pt-24 md:pt-32 pb-24">
      {/* Header Section */}
      <section className="max-w-[1600px] mx-auto px-8 md:px-12">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={stagger}
          className="max-w-4xl mx-auto text-center mb-20 md:mb-24"
        >
          <motion.div variants={fadeUp} custom={0} className="mb-6">
            <span className="text-text-light text-xs font-black tracking-[0.5em] uppercase">Collections de prestige</span>
          </motion.div>
          <motion.h1 variants={fadeUp} custom={1} className="text-4xl md:text-5xl font-serif text-text-dark mb-8 tracking-tight">
            Le Catalogue
          </motion.h1>
          <motion.div variants={fadeUp} className="w-16 h-[1px] bg-text-dark mx-auto mb-8" />
          <motion.p variants={fadeUp} custom={2} className="text-sm md:text-base uppercase tracking-[0.25em] text-text-medium max-w-xl mx-auto leading-relaxed font-medium">
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
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-8 gap-y-16"
          >
            {products.map((product, i) => (
              <motion.div key={product.id} variants={fadeUp} custom={i}>
                <Link to={`/product/${product.id}`} className="group block">
                  <div className="relative aspect-[3/4] overflow-hidden bg-white mb-6 shadow-sm group-hover:shadow-lg transition-all duration-700">
                    <img
                      src={product.image || 'https://via.placeholder.com/600x800?text=Produit'}
                      alt={product.name}
                      className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-700" />
                    
                    {product.price && (
                      <div className="absolute bottom-4 left-4">
                        <span className="bg-white/95 backdrop-blur-md text-text-dark px-4 py-2 text-xs font-black uppercase tracking-[0.3em] shadow-lg">
                          {product.price}€
                        </span>
                      </div>
                    )}
                  </div>
                  
                  <div className="space-y-2 px-1">
                    <p className="text-xs text-text-light uppercase tracking-[0.3em] font-black">
                      {product.category}
                    </p>
                    <h3 className="text-sm md:text-base font-bold text-text-dark uppercase tracking-widest group-hover:text-black transition-colors duration-500">
                      {product.name}
                    </h3>
                    <div className="flex items-center gap-3 pt-2 border-t border-transparent group-hover:border-slate-100 transition-colors">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-text-medium tracking-[0.2em] font-bold">4.8 / 5.0</span>
                      </div>
                      <span className="w-6 h-[1px] bg-border group-hover:bg-black transition-colors"></span>
                      <span className="text-xs text-text-dark uppercase font-black tracking-[0.3em] opacity-0 group-hover:opacity-100 transition-all duration-500 translate-x-[-10px] group-hover:translate-x-0">
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
            className="text-center py-32 border-2 border-dashed border-slate-100 rounded-3xl"
          >
            <h3 className="text-2xl font-serif text-text-dark mb-4">Aucune pièce disponible</h3>
            <p className="text-xs uppercase tracking-[0.4em] text-text-light font-bold">
              Notre collection est en cours de renouvellement.
            </p>
          </motion.div>
        )}
      </section>
    </div>
  );
};

export default ProductCatalogue;

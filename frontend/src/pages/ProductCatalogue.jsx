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
            <span className="text-text-light text-[10px] font-bold tracking-[0.4em] uppercase">Collections</span>
          </motion.div>
          <motion.h1 variants={fadeUp} custom={1} className="text-4xl md:text-5xl font-serif text-text-dark mb-6">
            Le Catalogue
          </motion.h1>
          <motion.div variants={fadeUp} className="w-12 h-[1px] bg-green mx-auto mb-8" />
          <motion.p variants={fadeUp} custom={2} className="text-[13px] uppercase tracking-widest text-text-medium max-w-md mx-auto leading-relaxed">
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
                  <div className="relative aspect-[4/5] overflow-hidden bg-white mb-6">
                    <img
                      src={product.image || 'https://via.placeholder.com/600x750?text=Produit'}
                      alt={product.name}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-500" />
                    
                    {product.price && (
                      <div className="absolute bottom-4 left-4">
                        <span className="bg-white/90 backdrop-blur-sm text-text-dark px-4 py-2 text-[11px] font-bold uppercase tracking-widest shadow-sm">
                          {product.price}€
                        </span>
                      </div>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <p className="text-[10px] text-text-light uppercase tracking-[0.2em] font-medium">
                      {product.category}
                    </p>
                    <h3 className="text-[13px] font-bold text-text-dark uppercase tracking-wider group-hover:text-green transition-colors duration-300">
                      {product.name}
                    </h3>
                    <div className="flex items-center gap-3 pt-2">
                      <div className="flex items-center gap-1">
                        <span className="text-[10px] text-text-medium tracking-widest">4.8 / 5.0</span>
                      </div>
                      <span className="w-4 h-[1px] bg-border"></span>
                      <span className="text-[10px] text-green uppercase font-bold tracking-widest opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        Détails
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
            <h3 className="text-xl font-serif text-text-dark mb-4">Aucune pièce disponible</h3>
            <p className="text-[11px] uppercase tracking-widest text-text-light">
              Notre collection est en cours de renouvellement.
            </p>
          </motion.div>
        )}
      </section>
    </div>
  );
};

export default ProductCatalogue;

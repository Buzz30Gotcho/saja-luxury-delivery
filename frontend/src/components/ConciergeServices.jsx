import React from 'react';
import { motion } from 'framer-motion';
import { Star, Crown, Check, ShieldCheck, Zap, Sparkles, Diamond } from 'lucide-react';

const ConciergeServices = ({ showTitle = true, isOverview = false, isMinimal = false }) => {
  const subscriptions = [
    {
      id: 'prestige',
      title: 'Prestige',
      fullTitle: 'Abonnement de Prestige',
      price: '600',
      period: 'mois',
      icon: <Crown className={`${isMinimal ? 'w-5 h-5' : isOverview ? 'w-6 h-6' : 'w-8 h-8'} text-text-dark`} strokeWidth={1} />,
      features: [
        'Statut VIP & Priorité',
        "Sérénité d'entretien",
        'Accès "Private-Sale"',
        'Bilan vestimentaire trimestriel',
        'Retouches de base offertes'
      ],
      description: 'L\'excellence au quotidien.',
      color: 'bg-white',
      border: 'border-border'
    },
    {
      id: 'elite',
      title: 'Élite',
      fullTitle: "Abonnement d'Élite",
      price: '1 500',
      period: 'mois',
      icon: <Diamond className={`${isMinimal ? 'w-5 h-5' : isOverview ? 'w-6 h-6' : 'w-8 h-8'} text-text-dark`} strokeWidth={1} />,
      features: [
        'Service "No Limit"',
        'Itinérance VIP / Room-Service',
        'Frais de livraison annulés',
        'Accompagnement intégral',
        'Sourcing "Introuvable"',
        'Accès aux services Prestige'
      ],
      description: 'L\'expérience ultime sans limite.',
      color: 'bg-white',
      border: 'border-text-dark',
      highlight: true
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  if (isMinimal) {
    return (
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-12 py-6 border-y border-border"
      >
        <span className="text-[10px] font-black uppercase tracking-[0.4em] text-[#A69F95]">Abonnements</span>
        {subscriptions.map((sub) => (
          <div key={sub.id} className="flex items-center gap-4 group cursor-pointer">
            <div className="p-2 bg-[#FDFCFB] border border-border group-hover:bg-text-dark group-hover:text-white transition-all">
              {sub.icon}
            </div>
            <div className="flex flex-col">
              <span className="text-[11px] font-bold uppercase tracking-widest text-text-dark">{sub.title}</span>
              <span className="text-[10px] text-[#A69F95]">{sub.price}€ / mois</span>
            </div>
          </div>
        ))}
        <button className="text-[10px] font-black uppercase tracking-[0.2em] text-text-dark border-b border-text-dark pb-0.5 ml-4 hover:opacity-60 transition-opacity">
          En savoir plus
        </button>
      </motion.div>
    );
  }

  if (isOverview) {
    return (
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl mx-auto"
      >
        {subscriptions.map((sub) => (
          <motion.div
            key={sub.id}
            variants={itemVariants}
            className={`relative p-6 border ${sub.border} ${sub.color} hover:shadow-lg transition-all duration-500 group flex flex-col justify-between overflow-hidden`}
          >
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-[#FDFCFB] border border-border group-hover:bg-text-dark group-hover:text-white transition-colors duration-500">
                  {sub.icon}
                </div>
                <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-text-dark">
                  {sub.title}
                </h3>
              </div>
              <div className="text-right">
                <span className="text-lg font-serif text-text-dark">{sub.price}€</span>
                <span className="text-[8px] text-[#A69F95] uppercase tracking-widest block">/ mois</span>
              </div>
            </div>
            
            <p className="text-[11px] text-[#8C867E] leading-relaxed italic mb-4 line-clamp-2">
              {sub.description}
            </p>

            <button className="text-[9px] font-black uppercase tracking-[0.3em] text-text-dark flex items-center gap-2 group-hover:translate-x-1 transition-transform duration-300">
              Voir les privilèges <span className="text-base">→</span>
            </button>
          </motion.div>
        ))}
      </motion.div>
    );
  }

  return (
    <div className="space-y-12">
      {showTitle && (
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-2">
            <h2 className="text-3xl font-serif text-text-dark tracking-tight">Services Conciergerie</h2>
            <p className="text-sm text-[#A69F95] uppercase tracking-[0.2em] font-medium">
              Des privilèges exclusifs pour nos membres les plus exigeants
            </p>
          </div>
        </div>
      )}

      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 md:grid-cols-2 gap-8"
      >
        {subscriptions.map((sub) => (
          <motion.div
            key={sub.id}
            variants={itemVariants}
            className={`relative p-10 border ${sub.border} ${sub.color} transition-all duration-500 hover:shadow-2xl flex flex-col`}
          >
            {sub.highlight && (
              <div className="absolute -top-4 right-10 bg-black text-white px-4 py-1 text-[10px] font-black uppercase tracking-[0.3em]">
                Plus Exclusif
              </div>
            )}
            
            <div className="mb-10 flex justify-between items-start">
              <div className="p-4 bg-[#FDFCFB] border border-border">
                {sub.icon}
              </div>
              <div className="text-right">
                <div className="flex items-baseline justify-end gap-1">
                  <span className="text-3xl font-serif text-text-dark">{sub.price}€</span>
                  <span className="text-[10px] text-[#A69F95] uppercase tracking-widest">/ {sub.period}</span>
                </div>
              </div>
            </div>

            <h3 className="text-xl font-bold text-text-dark uppercase tracking-widest mb-8">
              {sub.fullTitle}
            </h3>

            <ul className="space-y-5 flex-grow mb-10">
              {sub.features.map((feature, idx) => (
                <li key={idx} className="flex items-start gap-4">
                  <div className="mt-1">
                    <Check size={14} className="text-text-dark" />
                  </div>
                  <span className="text-sm text-[#5C5751] font-medium leading-relaxed">
                    {feature}
                  </span>
                </li>
              ))}
            </ul>

            <button className={`w-full py-4 text-xs font-black uppercase tracking-[0.3em] transition-all duration-300 border ${
              sub.highlight 
                ? 'bg-text-dark text-white border-text-dark hover:bg-white hover:text-text-dark' 
                : 'bg-transparent text-text-dark border-border hover:bg-text-dark hover:text-white'
            }`}>
              Souscrire à l'offre
            </button>
          </motion.div>
        ))}
      </motion.div>

      <div className="p-8 border border-border bg-[#FDFCFB] flex flex-col md:flex-row items-center gap-8 justify-between">
        <div className="flex items-center gap-6">
          <div className="p-3 bg-white rounded-full border border-border">
            <Sparkles size={20} className="text-text-dark" />
          </div>
          <div className="space-y-1">
            <p className="text-sm font-bold text-text-dark uppercase tracking-widest">Besoin d'un service sur-mesure ?</p>
            <p className="text-xs text-[#A69F95] uppercase tracking-widest">Nos concierges sont à votre disposition 24/7</p>
          </div>
        </div>
        <button className="text-xs font-black uppercase tracking-[0.3em] text-text-dark hover:underline underline-offset-8">
          Contacter le concierge
        </button>
      </div>
    </div>
  );
};

export default ConciergeServices;
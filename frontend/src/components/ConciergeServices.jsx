import React from 'react';
import { motion } from 'framer-motion';
import { Star, Crown, Check, ShieldCheck, Zap, Sparkles, Diamond } from 'lucide-react';

const ConciergeServices = () => {
  const subscriptions = [
    {
      id: 'prestige',
      title: 'Abonnement de Prestige',
      price: '600',
      period: 'mois',
      icon: <Crown className="w-8 h-8 text-text-dark" strokeWidth={1} />,
      features: [
        'Statut VIP & Priorité',
        "Sérénité d'entretien",
        'Accès "Private-Sale"',
        'Bilan vestimentaire trimestriel',
        'Retouches de base offertes'
      ],
      color: 'bg-white',
      border: 'border-border'
    },
    {
      id: 'elite',
      title: "Abonnement d'Élite",
      price: '1 500',
      period: 'mois',
      icon: <Diamond className="w-8 h-8 text-text-dark" strokeWidth={1} />,
      features: [
        'Service "No Limit"',
        'Itinérance VIP / Room-Service',
        'Frais de livraison annulés',
        'Accompagnement intégral',
        'Sourcing "Introuvable"',
        'Accès aux services de la formule Prestige'
      ],
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

  return (
    <div className="space-y-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-2">
          <h2 className="text-3xl font-serif text-text-dark tracking-tight">Services Conciergerie</h2>
          <p className="text-sm text-[#A69F95] uppercase tracking-[0.2em] font-medium">
            Des privilèges exclusifs pour nos membres les plus exigeants
          </p>
        </div>
      </div>

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
              {sub.title}
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
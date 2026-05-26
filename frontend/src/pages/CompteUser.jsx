import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import UserSidebar from '../components/UserSidebar';
import UserProfile from '../components/UserProfile';
import OrderHistory from '../components/OrderHistory';
import AddressManager from '../components/AddressManager';
import PaymentMethods from '../components/PaymentMethods';
import { motion } from "framer-motion";

import sajaLogo from '/saja.png';

const DashboardUser = () => {
  const { user } = useAuth();
  const [activeSection, setActiveSection] = useState('profile');

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">Accès non autorisé</h2>
        </div>
      </div>
    );
  }

  const renderContent = () => {
    switch (activeSection) {
      case 'profile':
        return <UserProfile user={user} />;
      case 'orders':
        return <OrderHistory user={user} />;
      case 'addresses':
        return <AddressManager user={user} />;
      case 'payment':
        return <PaymentMethods user={user} />;
      default:
        return <UserProfile user={user} />;
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFCFB]">
      {/* Elite Header / Hero */}
      <div className="relative bg-white border-b border-border pt-40 pb-24 overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-1/2 h-full bg-[#FDFCFB] -skew-x-12 translate-x-1/4 pointer-events-none" />
        <div className="absolute top-20 left-10 w-64 h-64 bg-neutral-100 rounded-full blur-3xl opacity-50 pointer-events-none" />

        <div className="container mx-auto px-6 md:px-12 relative z-10">
          <div className="flex flex-col lg:flex-row justify-between items-center gap-16">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex-1 space-y-8"
            >
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-[1px] bg-[#A69F95]" />
                  <span className="text-xs text-[#A69F95] uppercase tracking-[0.6em] font-black italic">Espace Privé Élite</span>
                </div>
                <h1 className="text-5xl md:text-8xl font-serif text-text-dark tracking-tighter leading-none uppercase">
                  Tableau <br/>
                  <span className="italic font-light text-[#A69F95] ml-12 md:ml-24">de Bord</span>
                </h1>
              </div>
              
              <div className="flex items-center gap-8 pt-4">
                <div className="p-1 border border-border rounded-full scale-110">
                  <img 
                    src={user?.user_metadata?.avatar_url || `https://ui-avatars.com/api/?name=${user?.email}&background=random`} 
                    alt="Avatar" 
                    className="w-16 h-16 rounded-full grayscale hover:grayscale-0 transition-all duration-700"
                  />
                </div>
                <div className="space-y-1">
                  <p className="text-xl font-black text-text-dark uppercase tracking-widest">
                    {user?.user_metadata?.display_name || user?.email?.split('@')[0] || 'Membre Élite'}
                  </p>
                  <p className="text-xs text-[#A69F95] uppercase tracking-[0.3em] font-bold">
                    Membre depuis {new Date(user?.created_at).getFullYear()} &bull; ID #{user?.id?.slice(0, 8).toUpperCase()}
                  </p>
                </div>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1 }}
              className="relative"
            >
              <div className="relative z-10 p-12 bg-white shadow-2xl border border-border">
                <img 
                  src={sajaLogo} 
                  alt="SAJA" 
                  className="w-48 md:w-64 h-auto mix-blend-multiply opacity-80" 
                />
                <div className="absolute -bottom-4 -right-4 p-4 bg-black text-white text-[10px] font-black uppercase tracking-[0.4em]">
                  Certified
                </div>
              </div>
              <div className="absolute -top-6 -left-6 w-full h-full border border-[#EAE8E4] -z-10 translate-x-2 translate-y-2" />
            </motion.div>
          </div>
        </div>
      </div>

      <div className="max-w-[1600px] mx-auto py-20 px-6 sm:px-10 lg:px-12">
        <div className="flex flex-col lg:flex-row gap-20">
          <div className="lg:w-80 flex-shrink-0">
            <UserSidebar
              user={user}
              activeSection={activeSection}
              setActiveSection={setActiveSection}
            />
          </div>

          <main className="flex-1 min-w-0">
            <motion.div
              key={activeSection}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              {renderContent()}
            </motion.div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default DashboardUser;
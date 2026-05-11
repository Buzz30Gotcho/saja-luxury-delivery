import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import UserSidebar from '../components/UserSidebar';
import UserProfile from '../components/UserProfile';
import OrderHistory from '../components/OrderHistory';
import AddressManager from '../components/AddressManager';
import PaymentMethods from '../components/PaymentMethods';

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
      {/* Elite Header */}
      <div className="bg-white border-b border-border pt-32 pb-16">
        <div className="container mx-auto px-6 md:px-12">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col md:flex-row justify-between items-end gap-8"
          >
            <div className="space-y-4">
              <span className="text-xs text-[#A69F95] uppercase tracking-[0.6em] font-black italic">Votre Espace Privé</span>
              <h1 className="text-4xl md:text-6xl font-serif text-text-dark tracking-tight leading-tight uppercase">
                Tableau de <br/>Bord
              </h1>
            </div>
            <div className="flex items-center gap-6 pb-2">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-black text-text-dark uppercase tracking-widest">{user?.user_metadata?.display_name || 'Élite Member'}</p>
                <p className="text-[10px] text-[#A69F95] uppercase tracking-[0.3em] font-bold">Depuis {new Date(user?.created_at).getFullYear()}</p>
              </div>
              <div className="w-[1px] h-10 bg-border hidden sm:block" />
              <div className="p-1 border border-border rounded-full">
                <img 
                  src={user?.user_metadata?.avatar_url || `https://ui-avatars.com/api/?name=${user?.email}&background=random`} 
                  alt="Avatar" 
                  className="w-12 h-12 rounded-full grayscale"
                />
              </div>
            </div>
          </motion.div>
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
// pages/DashboardUser.jsx
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import UserSidebar from '../components/UserSidebar';
import OrderHistory from '../components/OrderHistory';


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
    <div className="min-h-screen bg-gray-50">
      {/* Header simple */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <h1 className="text-2xl font-bold text-gray-900">Mon Compte</h1>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto py-8">
        <div className="flex gap-8">
          {/* Sidebar */}
          <div className="w-80 flex-shrink-0">
            <UserSidebar 
              user={user}
              activeSection={activeSection}
              setActiveSection={setActiveSection}
            />
          </div>
          
          {/* Contenu principal */}
          <main className="flex-1 min-w-0">
            {renderContent()}
          </main>
        </div>
      </div>
    </div>
  );
};

// Composants pour les autres sections
const PaymentMethods = ({ user }) => (
  <div className="bg-white rounded-lg shadow-sm border border-gray-200">
    <div className="p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">Moyens de paiement</h2>
      <div className="text-center py-12">
        <div className="text-6xl mb-4">💳</div>
        <p className="text-gray-600">Aucun moyen de paiement enregistré</p>
        <button className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">
          Ajouter une carte
        </button>
      </div>
    </div>
  </div>
);

export default DashboardUser;
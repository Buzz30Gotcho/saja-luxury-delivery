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
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-[1600px] mx-auto py-12 px-6 sm:px-10 lg:px-12">
        <div className="flex flex-col lg:flex-row gap-12">
          <div className="lg:w-96 flex-shrink-0">
            <UserSidebar
              user={user}
              activeSection={activeSection}
              setActiveSection={setActiveSection}
            />
          </div>

          <main className="flex-1 min-w-0">{renderContent()}</main>
        </div>
      </div>
    </div>
  );
};

export default DashboardUser;
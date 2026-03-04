// components/User/UserSidebar.jsx (Version minimaliste)
import React from 'react';
import { useAuth } from '../context/AuthContext';

const UserSidebar = ({ user, activeSection, setActiveSection }) => {
  const { logout } = useAuth();

  const menuItems = [
    { id: 'profile', label: 'Profil', icon: '👤' },
    { id: 'orders', label: 'Commandes', icon: '📦' },
    { id: 'addresses', label: 'Adresses', icon: '📍' },
    { id: 'payment', label: 'Paiement', icon: '💳' },
    { id: 'favorites', label: 'Favoris', icon: '❤️' },
  ];

  const getProfileImage = () => {
    return user?.user_metadata?.avatar_url || 
           `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.email || 'U')}&background=6366f1`;
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 h-fit sticky top-6">
      {/* En-tête profil minimaliste */}
      <div className="flex items-center space-x-4 mb-6">
        <img
          src={getProfileImage()}
          alt="Profile"
          className="w-12 h-12 rounded-full border-2 border-gray-200 object-cover"
        />
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 text-sm truncate">
            {user?.user_metadata?.full_name || user?.email?.split('@')[0]}
          </h3>
          <p className="text-gray-500 text-xs truncate">{user?.email}</p>
        </div>
      </div>

      {/* Navigation minimaliste */}
      <nav className="space-y-1">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveSection(item.id)}
            className={`flex items-center space-x-3 w-full p-3 rounded-lg transition-all duration-200 text-sm ${
              activeSection === item.id
                ? 'bg-purple-50 text-purple-700 font-semibold'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            <span className="text-lg w-6 text-center">{item.icon}</span>
            <span className="text-left flex-1">{item.label}</span>
          </button>
        ))}
      </nav>

      {/* Déconnexion */}
      <div className="mt-8 pt-6 border-t border-gray-100">
        <button
          onClick={logout}
          className="flex items-center space-x-2 w-full p-3 text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-lg transition-colors text-sm"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          <span>Déconnexion</span>
        </button>
      </div>
    </div>
  );
};

export default UserSidebar;
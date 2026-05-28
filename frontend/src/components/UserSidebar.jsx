import React from 'react';
import { useAuth } from '../context/AuthContext';
import { User, Package, MapPin, CreditCard, LogOut, ChevronRight, Star } from 'lucide-react';

const UserSidebar = ({ user, activeSection, setActiveSection }) => {
  const { logout } = useAuth();

  const menuItems = [
    { id: 'profile', label: 'Mon Profil', icon: <User size={20} /> },
    { id: 'orders', label: 'Mes Commandes', icon: <Package size={20} /> },
    { id: 'addresses', label: 'Adresses', icon: <MapPin size={20} /> },
    { id: 'payment', label: 'Paiement', icon: <CreditCard size={20} /> },
    { id: 'concierge', label: 'Conciergerie', icon: <Star size={20} /> },
  ];

  return (
    <div className="space-y-12 sticky top-40">
      {/* Navigation */}
      <nav className="space-y-3">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveSection(item.id)}
            className={`flex items-center justify-between w-full px-8 py-5 transition-all duration-300 group ${
              activeSection === item.id
                ? 'bg-black text-white shadow-xl translate-x-2'
                : 'text-text-medium hover:text-text-dark hover:bg-white border border-transparent hover:border-border'
            }`}
          >
            <div className="flex items-center gap-6">
              <span className={`${activeSection === item.id ? 'text-white' : 'text-[#8C867E] group-hover:text-text-dark'} transition-colors`}>
                {item.icon}
              </span>
              <span className="text-sm font-black uppercase tracking-[0.3em]">{item.label}</span>
            </div>
            <ChevronRight size={14} className={`transition-all duration-500 ${activeSection === item.id ? 'opacity-100' : 'opacity-0 -translate-x-4'}`} />
          </button>
        ))}
      </nav>

      {/* Luxury Message / Stats */}
      <div className="p-8 border border-border bg-white space-y-4">
        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-[#A69F95]">Statut Membre</p>
        <div className="space-y-1">
          <p className="text-2xl font-serif italic text-text-dark">Privilège</p>
          <p className="text-[11px] text-[#A69F95] uppercase tracking-widest leading-relaxed">Accès prioritaire à nos nouvelles collections.</p>
        </div>
      </div>

      {/* Déconnexion */}
      <button
        onClick={logout}
        className="flex items-center gap-4 px-8 py-4 text-text-light hover:text-danger transition-all duration-300 text-xs font-black uppercase tracking-[0.4em] group"
      >
        <LogOut size={16} className="group-hover:-translate-x-1 transition-transform" />
        <span>Quitter l'Espace</span>
      </button>
    </div>
  );
};

export default UserSidebar;
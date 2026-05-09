import React, { useState, useContext } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import CartContext from "../context/CartContext";
import { useDelivery } from "../context/DeliveryContext";
import { useTheme } from "../hooks/useTheme";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const { cartCount } = useContext(CartContext);
  const navigate = useNavigate();
  const location = useLocation();
  const isHomePage = location.pathname === '/';

  const handleLogout = async () => {
    try {
      await logout();
      setIsUserMenuOpen(false);
      setIsMenuOpen(false);
      navigate("/");
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    }
  };

  const getProfileImage = () => {
    return user?.user_metadata?.avatar_url || 
           user?.user_metadata?.picture ||
           `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.email || 'U')}&background=random`;
  };

  const getUserName = () => {
    return user?.user_metadata?.display_name ||
           user?.email?.split('@')[0] ||
           'Utilisateur';
  };

  const getUserRole = () => {
    return user?.role || user?.profile?.role || 'customer';
  };

  return (
    <header className="bg-white border-b border-neutral-light sticky top-0 z-50 shadow-sm transition-colors duration-500">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link to="/" className="flex items-center group py-1 transition-all duration-300">
            <img 
              src="/dripswift.png" 
              alt="Dripswift" 
              className="h-12 md:h-28 w-auto object-contain transform group-hover:scale-105 transition-all duration-500 mix-blend-multiply brightness-[1.02] contrast-[1.02] dark:invert dark:mix-blend-screen"
            />
          </Link>

          {/* Navigation Desktop */}
          <nav className="hidden md:flex items-center space-x-10">
            <Link
              to="/"
              className="text-text-medium hover:text-black font-bold text-lg md:text-xl uppercase tracking-[0.15em] transition-colors"
            >
              Accueil
            </Link>
            <Link
              to="/shops"
              className="text-text-medium hover:text-black font-bold text-lg md:text-xl uppercase tracking-[0.15em] transition-colors"
            >
              Boutiques
            </Link>
            <Link
              to="/catalogue"
              className="text-text-medium hover:text-black font-bold text-lg md:text-xl uppercase tracking-[0.15em] transition-colors"
            >
              Catalogue
            </Link>
          </nav>

          <div className="flex items-center space-x-3 md:space-x-6">
            <button
              type="button"
              onClick={toggleTheme}
              className="p-1.5 md:p-2 text-text-medium hover:text-black transition-colors"
              aria-label={theme === 'dark' ? 'Activer le mode clair' : 'Activer le mode sombre'}
              title={theme === 'dark' ? 'Mode clair' : 'Mode sombre'}
            >
              <span className="text-xl md:text-2xl">{theme === 'dark' ? '☀️' : '🌙'}</span>
            </button>

            {/* Panier */}
            <Link to="/cart" className="relative p-1.5 md:p-2 text-text-medium hover:text-black transition-colors">
              <svg className="w-6 h-6 md:w-7 md:h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              {cartCount > 0 && (
                <span className="absolute top-0 right-0 bg-black text-white text-[10px] md:text-[12px] font-bold rounded-full h-4 w-4 md:h-5 md:w-5 flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* Auth */}
            {user && user.id ? (
              <div className="relative">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="p-1 rounded-full hover:bg-neutral-light transition-colors"
                >
                  <img
                    src={getProfileImage()}
                    alt="Profile"
                    className="w-8 h-8 md:w-10 md:h-10 rounded-full object-cover border border-neutral-medium"
                    onError={(e) => e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.email || 'U')}&background=random`}
                  />
                </button>

                {/* Dropdown utilisateur */}
                <div className={`absolute right-0 mt-3 w-64 md:w-72 bg-white rounded-xl shadow-xl border border-neutral-light z-50 transition-all duration-300 origin-top-right ${
                  isUserMenuOpen ? 'scale-100 opacity-100' : 'scale-95 opacity-0 pointer-events-none'
                }`}>
                  <div className="p-6 border-b border-neutral-light flex justify-center flex-col items-center bg-neutral-50/50 rounded-t-xl">
                    <img
                      src={getProfileImage()}
                      alt="Profile"
                      className="w-16 h-16 md:w-20 md:h-20 rounded-full object-cover border-4 border-white shadow-sm mb-3"
                    />
                    <p className="text-base md:text-lg font-bold text-text-dark text-center truncate w-full">{getUserName()}</p>
                    <p className="text-[11px] md:text-xs text-text-light uppercase tracking-[0.25em] font-bold mt-1">{getUserRole()}</p>
                  </div>
                  <div className="p-2 flex flex-col">
                    <Link
                      to="/compte_user"
                      className="flex items-center space-x-3 px-4 py-3 text-text-medium hover:bg-neutral-light rounded-lg text-sm md:text-base transition-colors"
                      onClick={() => setIsUserMenuOpen(false)}
                    >
                      <span className="text-xl">👤</span> <span className="font-medium">Mon compte</span>
                    </Link>

                    {getUserRole() === 'shop_owner' && (
                      <Link
                        to="/merchant/dashboard"
                        className="flex items-center space-x-3 px-4 py-3 text-text-medium hover:bg-neutral-light rounded-lg text-sm md:text-base transition-colors"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        <span className="text-xl">🏬</span> <span className="font-medium">Dashboard Marchand</span>
                      </Link>
                    )}

                    <div className="my-1 border-t border-neutral-light/50"></div>

                    <button
                      onClick={handleLogout}
                      className="flex items-center space-x-3 w-full px-4 py-3 text-danger hover:bg-red-50 rounded-lg text-left text-sm md:text-base transition-colors"
                    >
                      <span className="text-xl">🚪</span> <span className="font-medium">Déconnexion</span>
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-2 md:space-x-6">
                <Link
                  to="/login"
                  className="font-bold text-[10px] md:text-base uppercase tracking-[0.1em] md:tracking-[0.15em] transition-colors text-text-medium hover:text-black"
                >
                  Connexion
                </Link>
                <Link
                  to="/register"
                  className="bg-text-dark text-white hover:bg-black px-2 py-2 md:px-6 md:py-3 text-[10px] md:text-base font-bold uppercase tracking-[0.1em] md:tracking-[0.15em] transition-colors shadow-sm"
                >
                  S'inscrire
                </Link>
              </div>
            )}

            {/* Menu Mobile Button */}
            <button
              className="md:hidden p-2 text-text-medium hover:text-black transition-colors"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden mt-2 bg-white border-t border-neutral-light shadow-lg rounded-b-lg p-4 animate-fade-in">
            <Link to="/" className="block py-2.5 text-lg text-text-medium hover:text-black transition-colors" onClick={() => setIsMenuOpen(false)}>Accueil</Link>
            <Link to="/shops" className="block py-2.5 text-lg text-text-medium hover:text-black transition-colors" onClick={() => setIsMenuOpen(false)}>Boutiques</Link>
            <Link to="/catalogue" className="block py-2.5 text-lg text-text-medium hover:text-black transition-colors" onClick={() => setIsMenuOpen(false)}>Catalogue</Link>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;

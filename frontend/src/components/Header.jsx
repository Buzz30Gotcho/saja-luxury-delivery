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
    <header className={`${
      isHomePage 
        ? "bg-[#0a0a0a] border-none shadow-none" 
        : "bg-[#ffffff] border-b border-neutral-light shadow-sm"
    } sticky top-0 z-50 transition-colors duration-500`}>
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link to="/" className="flex items-center group py-1 transition-all duration-300">
            <img 
              src="/dripswift.png" 
              alt="Dripswift" 
              className={`h-20 md:h-28 w-auto object-contain transform group-hover:scale-105 transition-all duration-500 ${
                isHomePage ? "brightness-[10] contrast-[100]" : "mix-blend-multiply"
              }`}
            />
          </Link>

          {/* Navigation Desktop */}
          <nav className="hidden md:flex items-center space-x-10">
            <Link
              to="/"
              className={`${
                isHomePage ? "text-white/60 hover:text-white" : "text-text-medium hover:text-black"
              } font-bold text-lg md:text-xl uppercase tracking-[0.15em] transition-colors`}
            >
              Accueil
            </Link>
            <Link
              to="/shops"
              className={`${
                isHomePage ? "text-white/60 hover:text-white" : "text-text-medium hover:text-black"
              } font-bold text-lg md:text-xl uppercase tracking-[0.15em] transition-colors`}
            >
              Boutiques
            </Link>
            <Link
              to="/catalogue"
              className={`${
                isHomePage ? "text-white/60 hover:text-white" : "text-text-medium hover:text-black"
              } font-bold text-lg md:text-xl uppercase tracking-[0.15em] transition-colors`}
            >
              Catalogue
            </Link>
          </nav>

          <div className="flex items-center space-x-6">
            <button
              type="button"
              onClick={toggleTheme}
              className={`p-2 transition-colors ${
                isHomePage ? "text-white/60 hover:text-white" : "text-text-medium hover:text-black"
              }`}
              aria-label={theme === 'dark' ? 'Activer le mode clair' : 'Activer le mode sombre'}
              title={theme === 'dark' ? 'Mode clair' : 'Mode sombre'}
            >
              <span className="text-2xl">{theme === 'dark' ? '☀️' : '🌙'}</span>
            </button>

            {/* Panier */}
            <Link to="/cart" className={`relative p-2 transition-colors ${
              isHomePage ? "text-white/60 hover:text-white" : "text-text-medium hover:text-black"
            }`}>
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              {cartCount > 0 && (
                <span className={`absolute top-0 right-0 ${
                  isHomePage ? "bg-white text-black" : "bg-black text-white"
                } text-[12px] font-bold rounded-full h-5 w-5 flex items-center justify-center`}>
                  {cartCount}
                </span>
              )}
            </Link>

            {/* Auth */}
            {user && user.id ? (
              <div className="relative">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className={`p-1 rounded-full transition-colors ${
                    isHomePage ? "hover:bg-white/10" : "hover:bg-neutral-light"
                  }`}
                >
                  <img
                    src={getProfileImage()}
                    alt="Profile"
                    className={`w-10 h-10 rounded-full object-cover border ${
                      isHomePage ? "border-white/20" : "border-neutral-medium"
                    }`}
                    onError={(e) => e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.email || 'U')}&background=random`}
                  />
                </button>

                {/* Dropdown utilisateur */}
                <div className={`absolute right-0 mt-2 w-52 bg-white rounded-lg shadow-lg border border-neutral-light z-50 transition-all duration-200 origin-top-right ${
                  isUserMenuOpen ? 'scale-100 opacity-100' : 'scale-95 opacity-0 pointer-events-none'
                }`}>
                  <div className="p-4 border-b border-neutral-light flex justify-center flex-col items-center">
                    <img
                      src={getProfileImage()}
                      alt="Profile"
                      className="w-12 h-12 rounded-full object-cover border-2 border-neutral-medium mb-2"
                    />
                    <p className="text-sm font-bold text-text-dark">{getUserName()}</p>
                    <p className="text-[10px] text-text-light uppercase tracking-[0.2em]">{getUserRole()}</p>
                  </div>
                  <div className="p-1 flex flex-col">
                    <Link
                      to="/compte_user"
                      className="flex items-center space-x-2 px-3 py-2 text-text-medium hover:bg-neutral-light rounded-md text-sm"
                      onClick={() => setIsUserMenuOpen(false)}
                    >
                      <span>👤</span> <span>Mon compte</span>
                    </Link>

                    {getUserRole() === 'shop_owner' && (
                      <Link
                        to="/merchant/dashboard"
                        className="flex items-center space-x-2 px-3 py-2 text-text-medium hover:bg-neutral-light rounded-md text-sm"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        <span>🏬</span> <span>Dashboard Marchand</span>
                      </Link>
                    )}

                    <button
                      onClick={handleLogout}
                      className="flex items-center space-x-2 w-full px-3 py-2 text-danger hover:bg-red-50 rounded-md text-left text-sm"
                    >
                      <span>🚪</span> <span>Déconnexion</span>
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-6">
                <Link
                  to="/login"
                  className={`font-bold text-sm md:text-base uppercase tracking-[0.15em] transition-colors ${
                    isHomePage ? "text-white/60 hover:text-white" : "text-text-medium hover:text-black"
                  }`}
                >
                  Connexion
                </Link>
                <Link
                  to="/register"
                  className={`${
                    isHomePage ? "bg-white text-black hover:bg-neutral-200" : "bg-text-dark text-white hover:bg-black"
                  } px-6 py-3 text-sm md:text-base font-bold uppercase tracking-[0.15em] transition-colors shadow-sm`}
                >
                  S'inscrire
                </Link>
              </div>
            )}

            {/* Menu Mobile Button */}
            <button
              className={`md:hidden p-2 transition-colors ${
                isHomePage ? "text-white/60 hover:text-white" : "text-text-medium hover:text-black"
              }`}
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
          <div className={`md:hidden mt-2 ${
            isHomePage ? "bg-[#1a1a1a]" : "bg-white"
          } border-t border-neutral-light shadow-lg rounded-b-lg p-4 animate-fade-in`}>
            <Link to="/" className={`block py-2.5 text-lg transition-colors ${
              isHomePage ? "text-white/60 hover:text-white" : "text-text-medium hover:text-black"
            }`} onClick={() => setIsMenuOpen(false)}>Accueil</Link>
            <Link to="/shops" className={`block py-2.5 text-lg transition-colors ${
              isHomePage ? "text-white/60 hover:text-white" : "text-text-medium hover:text-black"
            }`} onClick={() => setIsMenuOpen(false)}>Boutiques</Link>
            <Link to="/catalogue" className={`block py-2.5 text-lg transition-colors ${
              isHomePage ? "text-white/60 hover:text-white" : "text-text-medium hover:text-black"
            }`} onClick={() => setIsMenuOpen(false)}>Catalogue</Link>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;

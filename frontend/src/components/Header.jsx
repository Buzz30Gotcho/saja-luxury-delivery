import React, { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
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
    <header className="bg-background border-b border-neutral-light sticky top-0 z-50 shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3 hover:scale-100 transform transition-transform duration-200 min-w-0">
            <span className="font-serif font-bold text-green tracking-wider truncate text-xl sm:text-2xl md:text-3xl max-w-[140px] sm:max-w-xs uppercase">Shop In Line</span>
          </Link>

          {/* Navigation Desktop */}
          <nav className="hidden md:flex items-center space-x-10">
            <Link
              to="/"
              className="text-text-medium hover:text-green font-bold text-base uppercase tracking-[0.15em] transition-colors"
            >
              Accueil
            </Link>
            <Link
              to="/shops"
              className="text-text-medium hover:text-green font-bold text-base uppercase tracking-[0.15em] transition-colors"
            >
              Boutiques
            </Link>
            <Link
              to="/catalogue"
              className="text-text-medium hover:text-green font-bold text-base uppercase tracking-[0.15em] transition-colors"
            >
              Catalogue
            </Link>
          </nav>

          <div className="flex items-center space-x-6">
            <button
              type="button"
              onClick={toggleTheme}
              className="p-2 text-text-medium hover:text-green transition-colors"
              aria-label={theme === 'dark' ? 'Activer le mode clair' : 'Activer le mode sombre'}
              title={theme === 'dark' ? 'Mode clair' : 'Mode sombre'}
            >
              <span className="text-lg">{theme === 'dark' ? '☀️' : '🌙'}</span>
            </button>

            {/* Panier */}
            <Link to="/cart" className="relative p-2 text-text-medium hover:text-green transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              {cartCount > 0 && (
                <span className="absolute top-0 right-0 bg-green text-white text-[10px] font-bold rounded-full h-4 w-4 flex items-center justify-center">
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
                    className="w-8 h-8 rounded-full object-cover border border-neutral-medium"
                    onError={(e) => e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.email || 'U')}&background=random`}
                  />
                </button>

                {/* Dropdown utilisateur */}
                <div className={`absolute right-0 mt-2 w-52 bg-background rounded-lg shadow-lg border border-neutral-light z-50 transition-all duration-200 origin-top-right ${
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
              <div className="flex items-center space-x-4">
                <Link
                  to="/login"
                  className="text-text-medium hover:text-green font-bold text-xs uppercase tracking-[0.15em] transition-colors"
                >
                  Connexion
                </Link>
                <Link
                  to="/register"
                  className="bg-text-dark hover:bg-green text-white px-5 py-2 text-xs font-bold uppercase tracking-[0.15em] transition-colors shadow-sm"
                >
                  S'inscrire
                </Link>
              </div>
            )}

            {/* Menu Mobile Button */}
            <button
              className="md:hidden p-2 text-text-medium hover:text-green transition-colors"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden mt-2 bg-background border-t border-neutral-light shadow-lg rounded-b-lg p-4 animate-fade-in">
            <Link to="/" className="block py-2.5 text-lg text-text-medium hover:text-green transition-colors" onClick={() => setIsMenuOpen(false)}>Accueil</Link>
            <Link to="/shops" className="block py-2.5 text-lg text-text-medium hover:text-green transition-colors" onClick={() => setIsMenuOpen(false)}>Boutiques</Link>
            <Link to="/catalogue" className="block py-2.5 text-lg text-text-medium hover:text-green transition-colors" onClick={() => setIsMenuOpen(false)}>Catalogue</Link>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;

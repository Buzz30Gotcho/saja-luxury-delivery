// components/common/Layout.jsx
import React from 'react';
import { useLocation, Outlet } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import ScrollToTop from './ScrollToTop';

const Layout = () => {
  const location = useLocation();

  // Liste des pages SANS header/footer
  const noLayoutPages = ['/login', '/register', '/admin', '/checkout/confirmation','/merchant/login_merchant', '/merchant/register_merchant'];
  const shouldShowLayout = !noLayoutPages.includes(location.pathname);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <ScrollToTop />
      {/* Header conditionnel */}
      {shouldShowLayout && <Header />}
      
      {/* Contenu principal */}
      <main className={shouldShowLayout ? "flex-1" : "min-h-screen"}>
        {/* ⚡️ C’est ici que React Router affichera la page */}
        <Outlet /> 
      </main>
      
      {/* Footer conditionnel */}
      {shouldShowLayout && <Footer />}
    </div>
  );
};

export default Layout;

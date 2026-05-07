import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Instagram, Twitter, Facebook, ArrowRight, Mail } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-card pt-16 pb-8 border-t border-border relative overflow-hidden">
      {/* Subtle Background Glow */}
      <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-green/5 rounded-full blur-[100px] -mr-48 -mb-48 pointer-events-none" />

      <div className="container mx-auto px-6 md:px-12 relative z-10">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          <div className="space-y-6">
            <Link to="/" className="flex items-center gap-3 group">
              <img 
                src="/dripswift.png" 
                alt="Dripswift" 
                className="h-10 w-auto object-contain transition-transform duration-300 group-hover:scale-110" 
              />
              <h1 className="text-2xl font-black italic tracking-tighter flex items-center leading-none">
                <span className="text-primary-dark dark:text-white">DRIP</span>
                <span className="text-green dark:text-green-light">SWIFT</span>
              </h1>
            </Link>
            <div className="space-y-3">
              <p className="text-xs md:text-sm text-text-medium font-light italic leading-relaxed">
                "L'élégance n'est pas de se faire remarquer, <br />mais de se faire remarquer."
              </p>
            </div>
            <div className="flex gap-4">
              {[Instagram, Twitter, Facebook].map((Icon, i) => (
                <motion.a
                  key={i}
                  href="#"
                  whileHover={{ y: -2, color: '#15803d' }}
                  className="text-text-light transition-colors"
                >
                  <Icon size={16} strokeWidth={1.5} />
                </motion.a>
              ))}
            </div>
          </div>

          <div className="space-y-6">
            <h4 className="text-[11px] md:text-[10px] font-black uppercase tracking-[0.4em] text-text-dark">Explore</h4>
            <ul className="space-y-3">
              {['Boutiques', 'Catalogue', 'Nouveautés'].map((item) => (
                <li key={item}>
                  <Link to={item === 'Boutiques' ? '/shops' : '/catalogue'} className="text-[12px] md:text-[11px] text-text-light uppercase tracking-[0.2em] font-bold hover:text-green transition-colors">
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-6">
            <h4 className="text-[11px] md:text-[10px] font-black uppercase tracking-[0.4em] text-text-dark">Partenaires</h4>
            <ul className="space-y-3">
              {['Devenir Partenaire', 'Accès Créateur', 'Espace Coursier'].map((item) => (
                <li key={item}>
                  <Link 
                    to={
                      item === 'Devenir Partenaire' ? '/merchant/register' : 
                      item === 'Accès Créateur' ? '/merchant/login' : 
                      '/coursier/login'
                    } 
                    className="text-[12px] md:text-[11px] text-text-dark dark:text-white uppercase tracking-[0.2em] font-bold hover:text-green transition-colors"
                  >
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-6">
            <h4 className="text-[11px] md:text-[10px] font-black uppercase tracking-[0.4em] text-text-dark">Contact</h4>
            <div className="space-y-3">
              <a 
                href="https://github.com/Buzz30Gotcho?tab=repositories" 
                target="_blank" 
                rel="noopener noreferrer"
                className="block text-[12px] md:text-[11px] text-text-medium uppercase tracking-widest font-bold hover:text-green transition-colors"
              >
                Frédéric Sar
              </a>
            </div>
          </div>
        </div>
        
        {/* Bottom Bar */}
        <div className="pt-8 border-t border-border/50 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-[11px] md:text-[10px] text-text-light uppercase tracking-[0.4em] font-black">
            © {new Date().getFullYear()} Dripswift International.
          </p>
          <div className="flex gap-8 text-[11px] md:text-[10px] text-text-light uppercase tracking-[0.4em] font-black">
            <Link to="/privacy" className="hover:text-green transition-colors">Confidentialité</Link>
            <Link to="/terms" className="hover:text-green transition-colors">Conditions</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
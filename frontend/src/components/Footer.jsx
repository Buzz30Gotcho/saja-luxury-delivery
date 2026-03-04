import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Instagram, Twitter, Facebook, ArrowRight, Mail } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-card pt-24 pb-12 border-t border-border relative overflow-hidden">
      {/* Subtle Background Glow */}
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-green/5 rounded-full blur-[120px] -mr-64 -mb-64 pointer-events-none" />

      <div className="container mx-auto px-6 md:px-12 relative z-10">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16 mb-24">
          <div className="space-y-8">
            <h3 className="text-2xl font-serif text-text-dark tracking-tighter">Shop In Line.</h3>
            <div className="space-y-4">
              <p className="text-[13px] text-text-medium font-light italic leading-relaxed">
                "L'élégance n'est pas de se faire remarquer, <br />mais de se faire remarquer."
              </p>
              <p className="text-[10px] text-text-light/60 font-medium leading-relaxed uppercase tracking-[0.2em]">
                Ce projet est une œuvre étudiante préliminaire, <br /> 
                le premier souffle d'une vision destinée à 
                s'épanouir et prendre vie prochainement.
              </p>
            </div>
            <div className="flex gap-6">
              {[Instagram, Twitter, Facebook].map((Icon, i) => (
                <motion.a
                  key={i}
                  href="#"
                  whileHover={{ y: -3, color: '#15803d' }}
                  className="text-text-light transition-colors"
                >
                  <Icon size={18} strokeWidth={1.5} />
                </motion.a>
              ))}
            </div>
          </div>

          <div className="space-y-8">
            <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-text-dark">Explore</h4>
            <ul className="space-y-4">
              {['Boutiques', 'Catalogue', 'Nouveautés'].map((item) => (
                <li key={item}>
                  <Link to={item === 'Boutiques' ? '/shops' : '/catalogue'} className="text-[11px] text-text-light uppercase tracking-[0.2em] font-bold hover:text-green transition-colors">
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-8">
            <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-text-dark">Partenaires</h4>
            <ul className="space-y-4">
              {['Devenir Partenaire', 'Accès Créateur'].map((item) => (
                <li key={item}>
                  <Link to={item === 'Devenir Partenaire' ? '/merchant/register' : '/merchant/login'} className="text-[11px] text-text-light uppercase tracking-[0.2em] font-bold hover:text-green transition-colors">
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-8">
            <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-text-dark">Contact</h4>
            <div className="space-y-4">
              <a 
                href="https://github.com/Buzz30Gotcho?tab=repositories" 
                target="_blank" 
                rel="noopener noreferrer"
                className="block text-[11px] text-text-medium uppercase tracking-widest font-bold hover:text-green transition-colors"
              >
                Frédéric Sar
              </a>
            </div>
          </div>
        </div>
        
        {/* Bottom Bar */}
        <div className="pt-12 border-t border-border/50 flex flex-col md:flex-row justify-between items-center gap-8">
          <p className="text-[9px] text-text-light uppercase tracking-[0.4em] font-black">
            © {new Date().getFullYear()} Shop In Line International.
          </p>
          <div className="flex gap-12 text-[9px] text-text-light uppercase tracking-[0.4em] font-black">
            <Link to="/privacy" className="hover:text-green transition-colors">Confidentialité</Link>
            <Link to="/terms" className="hover:text-green transition-colors">Conditions</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
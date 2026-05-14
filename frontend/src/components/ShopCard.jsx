import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, MapPin } from 'lucide-react';

const normalizeShopCity = (value = '') => {
  const raw = String(value || '').trim().toLowerCase();
  if (!raw) return null;
  if (raw.includes('bordeaux')) return 'Bordeaux';
  if (raw.includes('paris')) return 'Paris';
  if (raw.includes('cannes')) return 'Cannes';
  return null;
};

const ShopCard = ({ shop }) => {
  if (!shop) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 text-center text-gray-500">
        <p>Boutique non disponible</p>
      </div>
    );
  }

  const {
    id,
    name = 'Nom non disponible',
    category = 'Catégorie non spécifiée',
    description = '',
    city = 'Lieu non spécifié',
    location = 'Lieu non spécifié',
    address = '',
    image = 'https://via.placeholder.com/400x200/f3f4f6/9ca3af?text=Boutique+Indisponible',
  } = shop;

  const displayLocation =
    normalizeShopCity(city) ||
    normalizeShopCity(location) ||
    normalizeShopCity(address) ||
    city ||
    location ||
    'Ville partenaire';

  return (
    <div className="bg-card group rounded-none border border-border/40 hover:border-black/30 transition-colors duration-200 h-full flex flex-col relative overflow-hidden">
      <div className="relative aspect-[4/3] overflow-hidden bg-background">
        <img 
          src={image} 
          alt={name} 
          loading="lazy"
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <div className="absolute top-4 left-4">
          <span className="bg-white/90 backdrop-blur-md text-text-dark text-[10px] md:text-xs font-bold px-3 py-1 uppercase tracking-wider shadow-sm">
            {category}
          </span>
        </div>
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-200" />
      </div>

      <div className="p-6 flex flex-col flex-1">
        <div className="mb-4">
          <h3 className="text-lg md:text-xl font-serif text-text-dark tracking-tight">
            {name}
          </h3>
          <div className="w-8 h-[1px] bg-text-dark mt-3 group-hover:w-12 transition-[width] duration-200" />
        </div>

        {description && (
          <p className="text-text-medium text-sm leading-relaxed mb-6 line-clamp-2 font-light italic">
            {description}
          </p>
        )}

        <div className="mt-auto pt-4 border-t border-border flex items-center justify-between">
          <div className="flex items-center gap-2 text-text-light">
            <MapPin size={12} className="text-text-dark" />
            <p className="text-[10px] md:text-xs font-bold uppercase tracking-wider truncate max-w-[140px]">{displayLocation}</p>
          </div>

          <Link 
            to={`/shop/${id}`} 
            className="text-[10px] md:text-xs font-bold text-text-dark uppercase tracking-[0.18em] border-b border-transparent hover:border-black transition-[color,border-color] duration-150 pb-1"
          >
            Découvrir
          </Link>
        </div>
      </div>
    </div>
  );
  };

export default ShopCard;


import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

const UserProfile = ({ user }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    firstName: user?.user_metadata?.first_name || '',
    lastName: user?.user_metadata?.last_name || '',
    phone: user?.user_metadata?.phone || '',
    address: user?.user_metadata?.address || '',
  });

  const handleSave = async () => {
    // Ici vous ajouterez la logique pour sauvegarder les modifications
    // via votre service Supabase
    console.log('Sauvegarder:', formData);
    setIsEditing(false);
  };

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const getProfileImage = () => {
    return user?.user_metadata?.avatar_url || 
           user?.user_metadata?.picture || 
           `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.email || 'U')}&background=random`;
  };

  return (
    <div className="bg-white border border-border overflow-hidden">
      {/* En-tête du profil */}
      <div className="px-10 py-10 border-b border-border bg-[#FDFCFB]">
        <div className="flex justify-between items-center">
          <div className="space-y-1">
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-[#A69F95]">Données Personnelles</span>
            <h2 className="text-3xl font-serif text-text-dark">Profil Membre</h2>
          </div>
          <button
            onClick={() => setIsEditing(!isEditing)}
            className={`px-8 py-3 text-xs font-black uppercase tracking-[0.3em] transition-all ${
              isEditing 
                ? 'bg-neutral-light text-text-dark hover:bg-border' 
                : 'bg-black text-white hover:bg-neutral-800'
            }`}
          >
            {isEditing ? 'Annuler' : 'Modifier'}
          </button>
        </div>
      </div>

      <div className="p-12">
        <div className="flex flex-col md:flex-row items-start gap-16">
          {/* Photo de profil */}
          <div className="relative group">
            <div className="absolute inset-0 border border-border translate-x-3 translate-y-3 group-hover:translate-x-0 group-hover:translate-y-0 transition-transform duration-500" />
            <img
              src={getProfileImage()}
              alt="Profile"
              className="relative z-10 w-32 h-32 md:w-44 md:h-44 object-cover border border-border grayscale"
            />
          </div>

          {/* Informations */}
          <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-12">
            <div className="space-y-3">
              <label className="block text-[10px] font-black text-[#A69F95] uppercase tracking-[0.3em]">
                Prénom
              </label>
              {isEditing ? (
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  className="w-full bg-transparent border-b border-border py-2 text-xl text-text-dark focus:outline-none focus:border-black transition-all"
                />
              ) : (
                <p className="text-xl font-medium text-text-dark">
                  {formData.firstName || 'Non renseigné'}
                </p>
              )}
            </div>

            <div className="space-y-3">
              <label className="block text-[10px] font-black text-[#A69F95] uppercase tracking-[0.3em]">
                Nom
              </label>
              {isEditing ? (
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  className="w-full bg-transparent border-b border-border py-2 text-xl text-text-dark focus:outline-none focus:border-black transition-all"
                />
              ) : (
                <p className="text-xl font-medium text-text-dark">
                  {formData.lastName || 'Non renseigné'}
                </p>
              )}
            </div>

            <div className="space-y-3">
              <label className="block text-[10px] font-black text-[#A69F95] uppercase tracking-[0.3em]">
                Email
              </label>
              <div className="flex flex-col">
                <p className="text-xl font-medium text-text-dark">
                  {user?.email}
                </p>
                <div className="mt-2">
                  {user?.email_confirmed_at ? (
                    <span className="text-[9px] font-black text-emerald-600 border border-emerald-100 px-2 py-0.5 uppercase tracking-widest">Compte Vérifié</span>
                  ) : (
                    <span className="text-[9px] font-black text-red-600 border border-red-100 px-2 py-0.5 uppercase tracking-widest">Vérification Requise</span>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <label className="block text-[10px] font-black text-[#A69F95] uppercase tracking-[0.3em]">
                Téléphone
              </label>
              {isEditing ? (
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full bg-transparent border-b border-border py-2 text-xl text-text-dark focus:outline-none focus:border-black transition-all"
                />
              ) : (
                <p className="text-xl font-medium text-text-dark">
                  {formData.phone || 'Non renseigné'}
                </p>
              )}
            </div>

            <div className="md:col-span-2 space-y-3">
              <label className="block text-[10px] font-black text-[#A69F95] uppercase tracking-[0.3em]">
                Adresse Principale
              </label>
              {isEditing ? (
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  rows="2"
                  className="w-full bg-transparent border-b border-border py-2 text-xl text-text-dark focus:outline-none focus:border-black transition-all resize-none"
                />
              ) : (
                <p className="text-xl font-medium text-text-dark leading-relaxed">
                  {formData.address || 'Aucune adresse enregistrée'}
                </p>
              )}
            </div>
          </div>
        </div>

        {isEditing && (
          <div className="flex justify-end space-x-6 mt-16 pt-10 border-t border-border">
            <button
              onClick={() => setIsEditing(false)}
              className="px-8 py-4 text-[10px] font-black uppercase tracking-[0.3em] text-text-light hover:text-text-dark transition-all"
            >
              Annuler
            </button>
            <button
              onClick={handleSave}
              className="px-10 py-4 bg-black text-white text-[10px] font-black uppercase tracking-[0.4em] hover:bg-neutral-800 transition-all shadow-xl active:scale-95"
            >
              Sauvegarder les modifications
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserProfile;
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
    <div className="bg-white rounded-[2rem] shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
      {/* En-tête du profil */}
      <div className="px-10 py-8 border-b border-gray-100 bg-slate-50/50">
        <div className="flex justify-between items-center">
          <h2 className="text-3xl font-bold text-gray-900 font-serif tracking-tight">Informations personnelles</h2>
          <button
            onClick={() => setIsEditing(!isEditing)}
            className={`px-8 py-3 rounded-xl font-bold text-lg transition-all shadow-sm ${
              isEditing 
                ? 'bg-slate-200 text-slate-700 hover:bg-slate-300' 
                : 'bg-blue-600 text-white hover:bg-blue-700 hover:shadow-lg'
            }`}
          >
            {isEditing ? 'Annuler' : 'Modifier le profil'}
          </button>
        </div>
      </div>

      <div className="p-10 lg:p-12">
        <div className="flex flex-col md:flex-row items-start gap-12">
          {/* Photo de profil */}
          <div className="text-center space-y-4">
            <div className="relative group">
              <img
                src={getProfileImage()}
                alt="Profile"
                className="w-40 h-40 rounded-full object-cover border-8 border-white shadow-xl transition-transform duration-500 group-hover:scale-105"
              />
              {isEditing && (
                <div className="absolute inset-0 bg-black/20 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                  <span className="text-white font-bold text-sm">Changer</span>
                </div>
              )}
            </div>
          </div>

          {/* Informations */}
          <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-10">
            <div className="space-y-2">
              <label className="block text-sm font-black text-gray-400 uppercase tracking-[0.2em]">
                Prénom
              </label>
              {isEditing ? (
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  className="w-full border-b-2 border-gray-200 focus:border-blue-500 bg-transparent py-3 text-xl font-bold text-gray-900 focus:outline-none transition-colors"
                />
              ) : (
                <p className="text-2xl font-bold text-gray-900">
                  {formData.firstName || 'Non renseigné'}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-black text-gray-400 uppercase tracking-[0.2em]">
                Nom
              </label>
              {isEditing ? (
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  className="w-full border-b-2 border-gray-200 focus:border-blue-500 bg-transparent py-3 text-xl font-bold text-gray-900 focus:outline-none transition-colors"
                />
              ) : (
                <p className="text-2xl font-bold text-gray-900">
                  {formData.lastName || 'Non renseigné'}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-black text-gray-400 uppercase tracking-[0.2em]">
                Adresse Email
              </label>
              <div className="flex flex-col">
                <p className="text-2xl font-bold text-gray-900">
                  {user?.email}
                </p>
                <p className="text-sm font-bold mt-1">
                  {user?.email_confirmed_at ? (
                    <span className="text-green-600">✓ Compte vérifié</span>
                  ) : (
                    <span className="text-danger">⚠ Non vérifié</span>
                  )}
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-black text-gray-400 uppercase tracking-[0.2em]">
                Téléphone
              </label>
              {isEditing ? (
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full border-b-2 border-gray-200 focus:border-blue-500 bg-transparent py-3 text-xl font-bold text-gray-900 focus:outline-none transition-colors"
                />
              ) : (
                <p className="text-2xl font-bold text-gray-900">
                  {formData.phone || 'Non renseigné'}
                </p>
              )}
            </div>

            <div className="md:col-span-2 space-y-2">
              <label className="block text-sm font-black text-gray-400 uppercase tracking-[0.2em]">
                Adresse de livraison par défaut
              </label>
              {isEditing ? (
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  rows="3"
                  className="w-full border-b-2 border-gray-200 focus:border-blue-500 bg-transparent py-3 text-xl font-bold text-gray-900 focus:outline-none transition-colors resize-none"
                />
              ) : (
                <p className="text-2xl font-bold text-gray-900 leading-relaxed">
                  {formData.address || 'Aucune adresse enregistrée'}
                </p>
              )}
            </div>
          </div>
        </div>

        {isEditing && (
          <div className="flex justify-end space-x-6 mt-12 pt-10 border-t border-gray-100">
            <button
              onClick={() => setIsEditing(false)}
              className="px-10 py-4 font-bold text-lg text-gray-500 hover:text-gray-900 transition-colors"
            >
              Abandonner
            </button>
            <button
              onClick={handleSave}
              className="px-12 py-4 bg-green text-white rounded-2xl font-black text-lg hover:bg-green-dark transition-all shadow-lg shadow-green/20 active:scale-95 uppercase tracking-widest"
            >
              Enregistrer les modifications
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserProfile;
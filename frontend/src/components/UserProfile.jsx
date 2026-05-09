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
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      {/* En-tête du profil */}
      <div className="px-10 py-8 border-b border-gray-100 bg-gray-50/30">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900 font-serif">Informations personnelles</h2>
          <button
            onClick={() => setIsEditing(!isEditing)}
            className={`px-6 py-3 rounded-xl font-bold text-base transition-all ${
              isEditing 
                ? 'bg-gray-100 text-gray-600 hover:bg-gray-200' 
                : 'bg-black text-white hover:bg-neutral-800 shadow-sm'
            }`}
          >
            {isEditing ? 'Annuler' : 'Modifier'}
          </button>
        </div>
      </div>

      <div className="p-10">
        <div className="flex flex-col md:flex-row items-start gap-12">
          {/* Photo de profil */}
          <div className="text-center">
            <img
              src={getProfileImage()}
              alt="Profile"
              className="w-28 h-28 md:w-36 md:h-36 rounded-full object-cover border-4 border-gray-50 shadow-md"
            />
          </div>

          {/* Informations */}
          <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <label className="block text-sm font-black text-text-light uppercase tracking-[0.2em]">
                Prénom
              </label>
              {isEditing ? (
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  className="w-full border border-border rounded-xl px-4 py-3 text-xl text-text-dark focus:outline-none focus:border-black transition-all"
                />
              ) : (
                <p className="text-2xl font-medium text-text-dark">
                  {formData.firstName || 'Non renseigné'}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-black text-text-light uppercase tracking-[0.2em]">
                Nom
              </label>
              {isEditing ? (
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  className="w-full border border-border rounded-xl px-4 py-3 text-xl text-text-dark focus:outline-none focus:border-black transition-all"
                />
              ) : (
                <p className="text-2xl font-medium text-text-dark">
                  {formData.lastName || 'Non renseigné'}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-black text-text-light uppercase tracking-[0.2em]">
                Email
              </label>
              <div className="flex flex-col">
                <p className="text-2xl font-medium text-text-dark">
                  {user?.email}
                </p>
                <p className="text-xs font-bold mt-2">
                  {user?.email_confirmed_at ? (
                    <span className="text-success uppercase tracking-widest">✓ Compte Vérifié</span>
                  ) : (
                    <span className="text-danger uppercase tracking-widest">⚠ Email non confirmé</span>
                  )}
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-black text-text-light uppercase tracking-[0.2em]">
                Téléphone
              </label>
              {isEditing ? (
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full border border-border rounded-xl px-4 py-3 text-xl text-text-dark focus:outline-none focus:border-black transition-all"
                />
              ) : (
                <p className="text-2xl font-medium text-text-dark">
                  {formData.phone || 'Non renseigné'}
                </p>
              )}
            </div>

            <div className="md:col-span-2 space-y-2">
              <label className="block text-sm font-black text-text-light uppercase tracking-[0.2em]">
                Adresse par défaut
              </label>
              {isEditing ? (
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  rows="3"
                  className="w-full border border-border rounded-xl px-4 py-3 text-xl text-text-dark focus:outline-none focus:border-black transition-all"
                />
              ) : (
                <p className="text-2xl font-medium text-text-dark leading-relaxed">
                  {formData.address || 'Aucune adresse enregistrée'}
                </p>
              )}
            </div>
          </div>
        </div>

        {isEditing && (
          <div className="flex justify-end space-x-3 mt-8 pt-6 border-t border-gray-100">
            <button
              onClick={() => setIsEditing(false)}
              className="px-4 py-2 text-sm font-semibold text-gray-500 hover:text-gray-700 transition-colors"
            >
              Annuler
            </button>
            <button
              onClick={handleSave}
              className="px-6 py-2 bg-green text-white rounded-lg font-bold text-sm hover:bg-green-dark transition-all shadow-sm"
            >
              Enregistrer
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserProfile;
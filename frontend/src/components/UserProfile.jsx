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
      <div className="px-8 py-6 border-b border-gray-100 bg-gray-50/30">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-900">Informations personnelles</h2>
          <button
            onClick={() => setIsEditing(!isEditing)}
            className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all ${
              isEditing 
                ? 'bg-gray-100 text-gray-600 hover:bg-gray-200' 
                : 'bg-blue-600 text-white hover:bg-blue-700 shadow-sm'
            }`}
          >
            {isEditing ? 'Annuler' : 'Modifier'}
          </button>
        </div>
      </div>

      <div className="p-8">
        <div className="flex flex-col md:flex-row items-start gap-8">
          {/* Photo de profil */}
          <div className="text-center">
            <img
              src={getProfileImage()}
              alt="Profile"
              className="w-24 h-24 rounded-full object-cover border-4 border-gray-50 shadow-sm"
            />
          </div>

          {/* Informations */}
          <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Prénom
              </label>
              {isEditing ? (
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              ) : (
                <p className="text-lg font-medium text-gray-900">
                  {formData.firstName || 'Non renseigné'}
                </p>
              )}
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Nom
              </label>
              {isEditing ? (
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              ) : (
                <p className="text-lg font-medium text-gray-900">
                  {formData.lastName || 'Non renseigné'}
                </p>
              )}
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Email
              </label>
              <div className="flex flex-col">
                <p className="text-lg font-medium text-gray-900">
                  {user?.email}
                </p>
                <p className="text-xs font-medium mt-1">
                  {user?.email_confirmed_at ? (
                    <span className="text-green-600">✓ Confirmé</span>
                  ) : (
                    <span className="text-danger">⚠ Non confirmé</span>
                  )}
                </p>
              </div>
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Téléphone
              </label>
              {isEditing ? (
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              ) : (
                <p className="text-lg font-medium text-gray-900">
                  {formData.phone || 'Non renseigné'}
                </p>
              )}
            </div>

            <div className="md:col-span-2 space-y-1">
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Adresse par défaut
              </label>
              {isEditing ? (
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  rows="3"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              ) : (
                <p className="text-lg font-medium text-gray-900 leading-relaxed">
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
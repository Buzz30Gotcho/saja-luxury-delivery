import { supabase } from '../lib/supabaseClient';

export const authService = {
  // Connexion email/mot de passe
  signIn: async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    return { data, error };
  },

   
// Inscription
signUp: async (email, password, userData = {}) => {
  try {
    const finalEmail = email.trim().toLowerCase();
    const role = userData.role || 'customer';
    const display_name = userData.display_name || userData.firstName || finalEmail.split('@')[0];

    const { data, error } = await supabase.auth.signUp({
      email: finalEmail,
      password,
      options: {
        data: {
          ...userData,
          display_name,
          role
        }
      }
    });

    if (error) {
      console.error('❌ Erreur Auth:', error);
      return { success: false, error: error.message };
    }

    return {
      success: true,
      requiresEmailConfirmation: !data.session,
      user: data.user,
      session: data.session
    };
  } catch (error) {
    console.error('💥 Erreur inattendue:', error);
    return { success: false, error: error.message };
  }
},


  // Déconnexion
  signOut: async () => {
    const { error } = await supabase.auth.signOut();
    return { error };
  },

  // Récupérer l'utilisateur actuel
  getCurrentUser: async () => {
    const { data } = await supabase.auth.getUser();
    return data?.user ?? null;
  },

  // Récupérer le profil complet (table profiles)
  getUserProfile: async (userId) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    return { data, error };
  },

  // Connexion Google
  signInWithGoogle: async () => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin + '/', // redirection après login
      },
    });
    return { data, error };
  },

  // Enregistrer le consentement utilisateur
  recordConsent: async (userId, consentType, granted, ipAddress = null) => {
    const { data, error } = await supabase
      .from('user_consents')
      .insert([
        {
          user_id: userId,
          consent_type: consentType,
          granted: granted,
          ip_address: ipAddress
        }
      ]);

    return { data, error };
  },

  // MISE À JOUR DU PROFIL (FONCTION RGPD)
  updateProfile: async (userId, updates) => {
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId);
    return { data, error };
  }
};

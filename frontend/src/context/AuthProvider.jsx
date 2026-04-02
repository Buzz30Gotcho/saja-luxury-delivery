import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '../lib/supabaseClient';
import { authService } from '../services/authService';
import { AuthContext } from './AuthContext';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState(null);

  // Fonction pour charger le profil de l'utilisateur de manière asynchrone (non-bloquante)
  const loadProfile = async (currentUser) => {
    if (!currentUser) return;
    console.log('[AuthProvider] Chargement du profil en arrière-plan...');
    try {
      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", currentUser.id)
        .maybeSingle();

      if (profileData) {
        console.log('[AuthProvider] Profil trouvé, mise à jour de l\'utilisateur.');
        setUser(prev => {
          // Si on est déjà coursier dans les métadonnées, on ne veut pas être "rétrogradé" par erreur en customer
          const finalRole = profileData.role || prev?.role || 'customer';
          return {
            ...prev,
            ...currentUser,
            role: finalRole,
            profile: profileData
          };
        });
      }
    } catch (err) {
      console.warn('[AuthProvider] Erreur profil (non-bloquant):', err);
    }
  };

  useEffect(() => {
    console.log('[AuthProvider] Initialisation...');
    
    // Initial check de session
    const checkUser = async () => {
      setLoading(true);
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) throw error;
        
        if (session?.user) {
          console.log('[AuthProvider] Session active trouvée, chargement du profil...');
          setUser({
            ...session.user,
            role: session.user.user_metadata?.role || 'customer'
          });
          // On ne bloque pas avec await
          loadProfile(session.user);
        }
      } catch (err) {
        console.error('[AuthProvider] Erreur checkUser:', err);
      } finally {
        setLoading(false);
      }
    };

    checkUser();

    // Listener de changements de session
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('[AuthProvider] Auth event:', event, 'User ID:', session?.user?.id);
      
      const currentUser = session?.user || null;
      if (currentUser) {
        // MISE À JOUR IMMÉDIATE DE L'UTILISATEUR
        setUser({
          ...currentUser,
          role: currentUser.user_metadata?.role || 'customer'
        });
        
        // On lance le chargement du profil sans await
        loadProfile(currentUser);
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  const login = async (email, password) => {
    setAuthLoading(true);
    setAuthError(null);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      
      // FORCER LA MISE À JOUR DE L'UTILISATEUR IMMÉDIATEMENT
      if (data?.user) {
        setUser({
          ...data.user,
          role: data.user.user_metadata?.role || 'customer'
        });
        loadProfile(data.user);
      }
      
      return { success: true, user: data.user };
    } catch (error) {
      setAuthError(error.message);
      return { success: false, error: error.message };
    } finally {
      setAuthLoading(false);
    }
  };

  const register = async (email, password, userData = {}) => {
    setAuthLoading(true);
    setAuthError(null);
    try {
      const result = await authService.signUp(email, password, userData);
      return result;
    } catch (error) {
      setAuthError(error.message);
      return { success: false, error: error.message };
    } finally {
      setAuthLoading(false);
    }
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
    } catch (error) {
      console.error('[AuthProvider] Logout error:', error);
    }
  };

  const value = useMemo(() => ({
    user,
    login,
    register,
    logout,
    loading,
    authLoading,
    authError,
    signInWithGoogle: authService.signInWithGoogle
  }), [user, loading, authLoading, authError]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

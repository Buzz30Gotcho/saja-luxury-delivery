import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { authService } from '../services/authService';
import { AuthContext } from './AuthContext';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authLoading, setAuthLoading] = useState(false);

  useEffect(() => {
    checkUser();
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth event:', event, session);
      
      if (event === 'SIGNED_IN' && session?.user) {
        setUser(session.user);
        // Redirection gérée par Supabase via l'option redirectTo
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

 const checkUser = async () => {
  try {
    const { data } = await supabase.auth.getUser();
    const currentUser = data?.user;

    if (currentUser) {
      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", currentUser.id)
        .maybeSingle();

      setUser({
        ...currentUser,
        profile: profileData || null,
      });
    } else {
      setUser(null);
    }
  } catch (error) {
    console.error("Erreur vérification utilisateur:", error);
  } finally {
    setLoading(false);
  }
};


  const login = async (email, password) => {
    setAuthLoading(true);
    try {
      const { data, error } = await authService.signIn(email, password);
      if (error) throw error;
      setUser(data.user);
      return { success: true, data };
    } catch (error) {
      return { success: false, error: error.message };
    } finally {
      setAuthLoading(false);
    }
  };

  // CONNEXION GOOGLE CORRIGÉE - AVEC REDIRECTION
  const signInWithGoogle = async () => {
    setAuthLoading(true);
    try {
      const { data, error } = await authService.signInWithGoogle();
      
      if (error) throw error;
      
      // Supabase gère automatiquement la redirection OAuth
      // via l'option redirectTo dans authService
      return { success: true, data };
    } catch (error) {
      return { success: false, error: error.message };
    } finally {
      setAuthLoading(false);
    }
  };

  // INSCRIPTION CORRIGÉE
  const register = async (email, password, userData = {}) => {
    setAuthLoading(true);
    try {
      const { data, error } = await authService.signUp(email, password, userData);
      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      return { success: false, error: error.message };
    } finally {
      setAuthLoading(false);
    }
  };

  // DÉCONNEXION
  const logout = async () => {
    try {
      const { error } = await authService.signOut();
      if (error) throw error;
      setUser(null);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const value = {
    user,
    login,
    signInWithGoogle,
    register,
    logout,
    loading,
    authLoading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
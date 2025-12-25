import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

const AuthContext = createContext({});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch user profile
  const fetchProfile = useCallback(async (userId) => {
    if (!isSupabaseConfigured()) return null;
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;
      return data;
    } catch (err) {
      console.error('Error fetching profile:', err);
      return null;
    }
  }, []);

  // Initialize auth state - rely on onAuthStateChange which is more reliable
  useEffect(() => {
    if (!isSupabaseConfigured()) {
      console.log('Supabase not configured, skipping auth init');
      setLoading(false);
      return;
    }

    console.log('Setting up auth listener...');
    
    // Set a max loading time
    const maxLoadingTimeout = setTimeout(() => {
      console.log('Max loading time reached');
      setLoading(false);
    }, 2000);

    // Listen for auth changes - this will fire with INITIAL_SESSION
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth event:', event, session?.user?.email);
        
        clearTimeout(maxLoadingTimeout);
        
        if (session?.user) {
          setUser(session.user);
          setProfile(null); // Skip profile for now
        } else {
          setUser(null);
          setProfile(null);
        }
        
        setLoading(false);
      }
    );

    return () => {
      clearTimeout(maxLoadingTimeout);
      subscription?.unsubscribe();
    };
  }, []);

  // Sign up with email
  const signUp = useCallback(async (email, password, fullName) => {
    if (!isSupabaseConfigured()) {
      throw new Error('Supabase is not configured');
    }

    setError(null);
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName
        }
      }
    });

    if (error) {
      setError(error.message);
      throw error;
    }

    return data;
  }, []);

  // Sign in with email
  const signIn = useCallback(async (email, password) => {
    if (!isSupabaseConfigured()) {
      console.error('Supabase not configured. Check VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY');
      throw new Error('Supabase is not configured. Please contact support.');
    }

    setError(null);
    console.log('Attempting sign in for:', email);
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      console.error('Sign in error:', error);
      setError(error.message);
      throw error;
    }

    console.log('Sign in successful');
    return data;
  }, []);

  // Sign in with OAuth (Google, GitHub, etc.)
  const signInWithOAuth = useCallback(async (provider) => {
    if (!isSupabaseConfigured()) {
      throw new Error('Supabase is not configured');
    }

    setError(null);
    
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: window.location.origin
      }
    });

    if (error) {
      setError(error.message);
      throw error;
    }

    return data;
  }, []);

  // Sign out
  const signOut = useCallback(async () => {
    if (!isSupabaseConfigured()) {
      throw new Error('Supabase is not configured');
    }

    setError(null);
    
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      setError(error.message);
      throw error;
    }

    setUser(null);
    setProfile(null);
  }, []);

  // Reset password
  const resetPassword = useCallback(async (email) => {
    if (!isSupabaseConfigured()) {
      throw new Error('Supabase is not configured');
    }

    setError(null);
    
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`
    });

    if (error) {
      setError(error.message);
      throw error;
    }

    return data;
  }, []);

  // Update password
  const updatePassword = useCallback(async (newPassword) => {
    if (!isSupabaseConfigured()) {
      throw new Error('Supabase is not configured');
    }

    setError(null);
    
    const { data, error } = await supabase.auth.updateUser({
      password: newPassword
    });

    if (error) {
      setError(error.message);
      throw error;
    }

    return data;
  }, []);

  // Update profile
  const updateProfile = useCallback(async (updates) => {
    if (!isSupabaseConfigured() || !user) {
      throw new Error('Not authenticated');
    }

    setError(null);
    
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', user.id)
      .select()
      .single();

    if (error) {
      setError(error.message);
      throw error;
    }

    setProfile(data);
    return data;
  }, [user]);

  const value = {
    user,
    profile,
    loading,
    error,
    isAuthenticated: !!user,
    isConfigured: isSupabaseConfigured(),
    signUp,
    signIn,
    signInWithOAuth,
    signOut,
    resetPassword,
    updatePassword,
    updateProfile,
    refreshProfile: () => user && fetchProfile(user.id).then(setProfile)
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export default AuthContext;



import React, { createContext, useState, useContext, useEffect } from 'react';
import { supabase } from './supabase';
import { toast } from 'sonner';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);

  useEffect(() => {
    // 1. Check current session
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setUser(session.user);
        setIsAuthenticated(true);
        fetchProfile(session.user.id);
      }
      setIsLoadingAuth(false);
    };

    checkSession();

    // 2. Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session) {
        setUser(session.user);
        setIsAuthenticated(true);
        fetchProfile(session.user.id);
      } else {
        setUser(null);
        setProfile(null);
        setIsAuthenticated(false);
      }
      setIsLoadingAuth(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const fetchProfile = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (data) setProfile(data);
      if (error) console.error('Fetch profile error:', error);
    } catch (e) {
      console.error(e);
    }
  };

  const deductCredit = async () => {
    if (!profile || profile.credits <= 0) {
      toast.error('Insufficient credits!');
      return false;
    }

    const { data, error } = await supabase
      .from('profiles')
      .update({ credits: profile.credits - 1 })
      .eq('id', user.id)
      .select()
      .single();

    if (data) {
      setProfile(data);
      return true;
    }
    return false;
  };

  const login = async (email, password) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  };

  const signup = async (email, password) => {
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) throw error;
  };

  const logout = async () => {
    await supabase.auth.signOut();
    toast.success('Logged out successfully');
  };

  return (
    <AuthContext.Provider value={{
      user,
      profile,
      isAuthenticated,
      isLoadingAuth,
      login,
      signup,
      logout,
      deductCredit,
      refreshProfile: () => fetchProfile(user?.id),
      isLoadingPublicSettings: false, // Mock/Compatibility
      authError: null,              // Mock/Compatibility
      navigateToLogin: () => window.location.href = '/Auth'
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

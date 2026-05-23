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
        fetchProfile(session.user.id, session.user);
      }
      setIsLoadingAuth(false);
    };

    checkSession();

    // 2. Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session) {
        setUser(session.user);
        setIsAuthenticated(true);
        fetchProfile(session.user.id, session.user);
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

  const fetchProfile = async (userId, currentUser = null) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      const activeUser = currentUser || user || (await supabase.auth.getUser()).data.user;
      const username = data?.username || activeUser?.user_metadata?.username || activeUser?.email?.split('@')[0];

      if (data) {
        setProfile({ ...data, username });
      } else if (activeUser) {
        setProfile({ username });
      }
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
      const activeUser = user || (await supabase.auth.getUser()).data.user;
      const username = data.username || activeUser?.user_metadata?.username || activeUser?.email?.split('@')[0];
      setProfile({ ...data, username });
      return true;
    }
    return false;
  };

  const login = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;

    try {
      const { data: profileData } = await supabase
        .from('profiles')
        .select('username')
        .eq('id', data.user.id)
        .single();
      return profileData?.username || data.user.user_metadata?.username || email.split('@')[0];
    } catch (e) {
      return data.user?.user_metadata?.username || email.split('@')[0];
    }
  };

  const signup = async (email, password, username) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: window.location.origin,
        data: {
          username: username
        }
      }
    });
    if (error) throw error;

    // Proactively try to sync username to profiles table if user was created immediately
    if (data?.user) {
      try {
        await supabase
          .from('profiles')
          .update({ username })
          .eq('id', data.user.id);
      } catch (e) {
        console.warn("Could not sync username directly to profiles:", e);
      }
    }
  };

  const resetPassword = async (email) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/ResetPassword`,
    });
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
      resetPassword,
      logout,
      deductCredit,
      refreshProfile: () => fetchProfile(user?.id, user),
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

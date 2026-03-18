import { createContext, useContext, useState, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';
import { supabase } from '../lib/supabase';

const AuthContext = createContext();

const GMAIL_TOKEN_KEY = 'gmail_access_token';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [gmailToken, setGmailToken] = useState(null);
  const [showGmailConnect, setShowGmailConnect] = useState(false);

  useEffect(() => {
    const init = async () => {
      const [{ data: { session } }, storedToken] = await Promise.all([
        supabase.auth.getSession(),
        SecureStore.getItemAsync(GMAIL_TOKEN_KEY),
      ]);
      setUser(session?.user ?? null);
      if (session?.user) fetchProfile(session.user.id);
      setGmailToken(storedToken || null);
      setLoading(false);
    };
    init();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) fetchProfile(session.user.id);
      else setProfile(null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (userId) => {
    const { data } = await supabase.from('profiles').select('*').eq('id', userId).single();
    setProfile(data);
  };

  const signUp = async (email, password, username, fullName) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { username, full_name: fullName } },
    });
    if (error) throw error;
    const { data, error: signInError } = await supabase.auth.signInWithPassword({ email, password });
    if (signInError) throw signInError;
    setShowGmailConnect(true);
    return data;
  };

  const signIn = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data;
  };

  const signInWithGoogle = async (idToken, accessToken) => {
    const { data, error } = await supabase.auth.signInWithIdToken({
      provider: 'google',
      token: idToken,
    });
    if (error) throw error;
    await SecureStore.setItemAsync(GMAIL_TOKEN_KEY, accessToken);
    setGmailToken(accessToken);
    return data;
  };

  const connectGmail = async (accessToken) => {
    await SecureStore.setItemAsync(GMAIL_TOKEN_KEY, accessToken);
    setGmailToken(accessToken);
    setShowGmailConnect(false);
  };

  const skipGmail = () => {
    setShowGmailConnect(false);
  };

  const clearGmailToken = async () => {
    await SecureStore.deleteItemAsync(GMAIL_TOKEN_KEY);
    setGmailToken(null);
  };

  const signOut = async () => {
    await Promise.all([
      supabase.auth.signOut(),
      SecureStore.deleteItemAsync(GMAIL_TOKEN_KEY),
    ]);
    setGmailToken(null);
  };

  const refreshProfile = () => user && fetchProfile(user.id);

  return (
    <AuthContext.Provider value={{
      user, profile, loading, gmailToken, showGmailConnect,
      signUp, signIn, signInWithGoogle, signOut, refreshProfile,
      connectGmail, skipGmail, clearGmailToken,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

const AuthContext = createContext(null);

const ADMIN_EMAILS = ['admin@dukanlink.com', 'admin@dukkanlink.in'];

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setIsAdmin(session?.user ? ADMIN_EMAILS.includes(session.user.email ?? '') : false);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setIsAdmin(session?.user ? ADMIN_EMAILS.includes(session.user.email ?? '') : false);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = useCallback(async (email, password) => {
    const { error } = await supabase.auth.signUp({ email, password });
    return { error: error?.message ?? null };
  }, []);

  const signIn = useCallback(async (email, password) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: error?.message ?? null };
  }, []);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setIsAdmin(false);
  }, []);

  return (
    <AuthContext.Provider value={{ user, session, loading, isAdmin, signUp, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

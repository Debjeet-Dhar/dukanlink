import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { createUserProfile, isAdmin as checkIsAdmin } from '../lib/auth';

const AuthContext = createContext(null);

const ADMIN_EMAILS = ['admin@dukanlink.com', 'admin@dukkanlink.in'];

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        const adminStatus = await checkIsAdmin();
        setIsAdmin(adminStatus);
      }
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        const adminStatus = await checkIsAdmin();
        setIsAdmin(adminStatus);
      } else {
        setIsAdmin(false);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = useCallback(async (email, password) => {
    try {
      const { data, error } = await supabase.auth.signUp({ email, password });
      if (error) throw error;

      if (data.user) {
        try {
          await createUserProfile(data.user.id, ADMIN_EMAILS.includes(email));
        } catch (profileError) {
          console.error('Failed to create user profile:', profileError);
        }
      }

      return { error: null };
    } catch (error) {
      return { error: error?.message ?? 'Sign up failed' };
    }
  }, []);

  const signIn = useCallback(async (email, password) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      return { error: null };
    } catch (error) {
      return { error: error?.message ?? 'Sign in failed' };
    }
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

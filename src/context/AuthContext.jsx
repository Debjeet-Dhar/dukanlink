import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { createUserProfile, isAdmin as checkIsAdmin } from '../lib/auth';

const AuthContext = createContext(null);

const SUPABASE_NOT_CONFIGURED_MSG =
  'Backend not connected. Create a .env file with VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY (see .env.example), then restart npm run dev.';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [emailConfirmed, setEmailConfirmed] = useState(false);

  const refreshAdminStatus = useCallback(async () => {
    const adminStatus = await checkIsAdmin();
    setIsAdmin(adminStatus);
    return adminStatus;
  }, []);

  const ensureUserProfile = async (authUser) => {
    if (!supabase) return;
    try {
      await createUserProfile(authUser.id, {
        email: authUser.email,
        fullName: authUser.user_metadata?.full_name || authUser.user_metadata?.name,
        avatarUrl: authUser.user_metadata?.avatar_url || authUser.user_metadata?.picture,
        lastSignInAt: authUser.last_sign_in_at,
      });
    } catch (err) {
      const isDup = err?.code === '23505' || err?.message?.includes?.('duplicate');
      if (!isDup) console.error('Profile creation error:', err);
    }
  };

  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return;
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setEmailConfirmed(!!session?.user?.email_confirmed_at);
      if (session?.user) {
        (async () => {
          await ensureUserProfile(session.user);
          await refreshAdminStatus();
        })();
      }
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setEmailConfirmed(!!session?.user?.email_confirmed_at);
      if (session?.user) {
        (async () => {
          await ensureUserProfile(session.user);
          await refreshAdminStatus();
        })();
      } else {
        setIsAdmin(false);
        setEmailConfirmed(false);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [refreshAdminStatus]);

  const signUp = useCallback(async (email, password) => {
    if (!supabase) return { error: SUPABASE_NOT_CONFIGURED_MSG, needsConfirmation: false };
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (error) throw error;

      if (data.user && data.user.email_confirmed_at) {
        await ensureUserProfile(data.user);
      }

      return { error: null, needsConfirmation: !data.user?.email_confirmed_at && !data.session };
    } catch (error) {
      return { error: error?.message ?? 'Sign up failed', needsConfirmation: false };
    }
  }, []);

  const signIn = useCallback(async (email, password) => {
    if (!supabase) return { error: SUPABASE_NOT_CONFIGURED_MSG, needsConfirmation: false };
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;

      if (data.user && !data.user.email_confirmed_at) {
        await supabase.auth.signOut();
        return { error: 'Please verify your email before signing in. Check your inbox.', needsConfirmation: true };
      }

      return { error: null };
    } catch (error) {
      return { error: error?.message ?? 'Sign in failed', needsConfirmation: false };
    }
  }, []);

  const signInWithGoogle = useCallback(async () => {
    if (!supabase) return { error: SUPABASE_NOT_CONFIGURED_MSG };
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (error) throw error;
      return { error: null };
    } catch (error) {
      return { error: error?.message ?? 'Google sign in failed' };
    }
  }, []);

  const resendConfirmation = useCallback(async (email) => {
    if (!supabase) return { error: SUPABASE_NOT_CONFIGURED_MSG };
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (error) throw error;
      return { error: null };
    } catch (error) {
      return { error: error?.message ?? 'Failed to resend confirmation' };
    }
  }, []);

  const signOut = useCallback(async () => {
    if (supabase) await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setIsAdmin(false);
    setEmailConfirmed(false);
  }, []);

  return (
    <AuthContext.Provider value={{
      user, session, loading, isAdmin, emailConfirmed,
      signUp, signIn, signInWithGoogle, resendConfirmation, signOut, refreshAdminStatus,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

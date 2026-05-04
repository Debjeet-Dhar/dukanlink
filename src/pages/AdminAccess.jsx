import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { isSupabaseConfigured } from '../lib/supabase';
import { checkIfAnyAdminExists, claimFirstAdmin } from '../lib/auth';
import { ArrowLeft, Loader2, Shield, AlertCircle, Check } from '../components/Icons';

export default function AdminAccess() {
  const { user, isAdmin, loading: authLoading, signIn, signUp, signOut, refreshAdminStatus } = useAuth();
  const [adminExists, setAdminExists] = useState(null);
  const [isSetup, setIsSetup] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    async function loadAdminState() {
      if (!isSupabaseConfigured) {
        setChecking(false);
        return;
      }
      const exists = await checkIfAnyAdminExists();
      setAdminExists(exists);
      setIsSetup(!exists);
      setChecking(false);
    }
    loadAdminState();
  }, []);

  const handleAuth = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    if (!email.trim() || !password.trim()) {
      setError('Email and password are required.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    const result = isSetup
      ? await signUp(email.trim(), password)
      : await signIn(email.trim(), password);
    setLoading(false);

    if (result.error) {
      setError(result.error);
      return;
    }

    if (isSetup && result.needsConfirmation) {
      setMessage('Admin account created. Verify your email, then return here and sign in to claim first admin access.');
    } else if (isSetup) {
      setMessage('Admin account created. Claim first admin access below.');
    }
  };

  const handleClaimAdmin = async () => {
    setError('');
    setMessage('');
    setLoading(true);
    try {
      const claimed = await claimFirstAdmin();
      if (!claimed) {
        setAdminExists(true);
        setIsSetup(false);
        setError('An admin already exists. Please sign in with the admin account.');
      } else {
        await refreshAdminStatus();
        setAdminExists(true);
        setIsSetup(false);
        setMessage('Admin access created successfully.');
      }
    } catch (err) {
      setError(err.message || 'Could not create admin access.');
    }
    setLoading(false);
  };

  if (authLoading || checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-50">
        <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
      </div>
    );
  }

  if (!isSupabaseConfigured) {
    return (
      <Shell>
        <Notice title="Database not configured" tone="warn">
          Add Supabase environment variables before using admin access.
        </Notice>
      </Shell>
    );
  }

  if (user && isAdmin) {
    return null;
  }

  if (user && !isAdmin && isSetup) {
    return (
      <Shell>
        <div className="space-y-5">
          <Notice title="Claim first admin" tone="success">
            No admin exists. Claim admin access for your signed-in account.
          </Notice>
          <button
            onClick={handleClaimAdmin}
            disabled={loading}
            className="btn-primary flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Shield className="w-4 h-4" />}
            Claim First Admin
          </button>
          <button onClick={signOut} className="btn-secondary w-full">Use a different account</button>
          {error && <ErrorMessage message={error} />}
          {message && <SuccessMessage message={message} />}
        </div>
      </Shell>
    );
  }

  if (user && !isAdmin && adminExists) {
    return (
      <Shell>
        <div className="space-y-5 text-center">
          <Notice title="Access denied" tone="warn">
            This account is not the admin account. Only one admin account is allowed.
          </Notice>
          <button onClick={signOut} className="btn-secondary w-full">Sign out</button>
        </div>
      </Shell>
    );
  }

  return (
    <Shell>
      <form onSubmit={handleAuth} className="space-y-4">
        <div className="rounded-2xl bg-primary-50 border border-primary-100 p-4">
          <p className="text-xs font-bold uppercase tracking-wide text-primary-700">
            {isSetup ? 'First admin setup' : 'Admin login'}
          </p>
          <p className="text-sm text-surface-600 mt-1">
            {isSetup
              ? 'No admin exists yet. Create the first admin account here.'
              : 'Admin already exists. Sign in with that admin account.'}
          </p>
        </div>

        <div className="space-y-2">
          <label htmlFor="admin-email" className="text-sm font-semibold text-surface-800">Email</label>
          <input
            id="admin-email"
            type="email"
            value={email}
            onChange={(e) => { setEmail(e.target.value); setError(''); }}
            className="input-field"
            placeholder="admin@example.com"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="admin-password" className="text-sm font-semibold text-surface-800">Password</label>
          <input
            id="admin-password"
            type="password"
            value={password}
            onChange={(e) => { setPassword(e.target.value); setError(''); }}
            className="input-field"
            placeholder="Minimum 6 characters"
          />
        </div>

        {error && <ErrorMessage message={error} />}
        {message && <SuccessMessage message={message} />}

        <button type="submit" disabled={loading} className="btn-primary flex items-center justify-center gap-2">
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Shield className="w-4 h-4" />}
          {isSetup ? 'Create Admin Account' : 'Sign In as Admin'}
        </button>
      </form>
    </Shell>
  );
}

function Shell({ children }) {
  return (
    <div className="min-h-screen bg-surface-100 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">
        <Link to="/" className="inline-flex items-center gap-2 text-sm font-semibold text-surface-500 hover:text-surface-700 mb-5">
          <ArrowLeft className="w-4 h-4" /> Back to site
        </Link>
        <div className="bg-white border border-surface-200 shadow-elevated rounded-2xl overflow-hidden">
          <div className="p-6 border-b border-surface-100 flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-surface-900 text-white flex items-center justify-center shadow-soft">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-surface-900">DukanLink Admin</h1>
              <p className="text-sm text-surface-500 mt-1">Secure platform access</p>
            </div>
          </div>
          <div className="p-6">{children}</div>
        </div>
      </div>
    </div>
  );
}

function Notice({ title, tone, children }) {
  const styles = tone === 'success'
    ? 'bg-primary-50 border-primary-200 text-primary-700'
    : 'bg-amber-50 border-amber-200 text-amber-700';
  return (
    <div className={`rounded-2xl border p-4 ${styles}`}>
      <p className="font-bold text-sm">{title}</p>
      <p className="text-sm mt-1">{children}</p>
    </div>
  );
}

function ErrorMessage({ message }) {
  return (
    <div className="flex items-center gap-2 rounded-xl bg-red-50 border border-red-200 p-3">
      <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
      <p className="text-sm font-medium text-red-600">{message}</p>
    </div>
  );
}

function SuccessMessage({ message }) {
  return (
    <div className="flex items-center gap-2 rounded-xl bg-primary-50 border border-primary-200 p-3">
      <Check className="w-4 h-4 text-primary-600 shrink-0" />
      <p className="text-sm font-medium text-primary-700">{message}</p>
    </div>
  );
}

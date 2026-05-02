import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Store, ChevronRight, Loader2, MessageCircle, Shield } from '../components/Icons';

export default function Login({ onBack }) {
  const { signIn, signUp } = useAuth();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!email.trim() || !password.trim()) {
      setError('Email and password are required.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    setLoading(true);
    if (isSignUp) {
      const { error: err } = await signUp(email.trim(), password);
      if (err) setError(err);
      else setError('');
    } else {
      const { error: err } = await signIn(email.trim(), password);
      if (err) setError(err);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen w-full flex flex-col bg-gradient-to-b from-primary-50/60 via-white to-white relative overflow-hidden">
      <div className="absolute top-0 -left-32 w-[400px] h-[400px] bg-primary-100/40 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-0 w-72 h-72 bg-primary-50/50 rounded-full blur-3xl" />

      <header className="relative px-4 sm:px-6 py-5 flex items-center justify-between max-w-3xl w-full mx-auto">
        <button onClick={onBack} className="inline-flex items-center gap-2 text-primary-600 font-bold text-lg hover:opacity-90 transition-opacity">
          <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center">
            <span className="text-white font-extrabold text-sm">D</span>
          </div>
          DukanLink
        </button>
      </header>

      <main className="relative flex-1 flex items-start sm:items-center justify-center px-4 sm:px-6 pb-16">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-elevated border border-surface-200/60 overflow-hidden">
            <div className="bg-gradient-to-br from-primary-50 to-primary-100/40 border-b border-primary-100/80 p-6 flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-primary-600 text-white flex items-center justify-center shadow-md shadow-primary-600/30 shrink-0">
                <MessageCircle className="w-6 h-6" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-primary-700 uppercase tracking-wide">
                  {isSignUp ? 'Create your account' : 'Sign in to your shop'}
                </p>
                <p className="text-sm text-surface-700 mt-1 leading-snug">
                  {isSignUp ? 'Sign up to start building your online shop.' : 'Use your email and password to continue.'}
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="text-center">
                <h2 className="text-2xl sm:text-[26px] font-bold tracking-tight text-surface-900">
                  {isSignUp ? 'Sign Up' : 'Login'}
                </h2>
              </div>

              <div className="space-y-2">
                <label htmlFor="login-email" className="text-sm font-medium text-surface-700">Email</label>
                <input
                  id="login-email"
                  type="email"
                  placeholder="you@example.com"
                  autoFocus
                  value={email}
                  onChange={e => { setEmail(e.target.value); setError(''); }}
                  className="w-full px-4 py-3.5 bg-white border-2 rounded-xl text-base transition-all duration-200 outline-none border-surface-200 focus:border-primary-500 focus:shadow-[0_0_0_3px_rgba(22,163,74,0.15)]"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="login-password" className="text-sm font-medium text-surface-700">Password</label>
                <input
                  id="login-password"
                  type="password"
                  placeholder="Min 6 characters"
                  value={password}
                  onChange={e => { setPassword(e.target.value); setError(''); }}
                  className="w-full px-4 py-3.5 bg-white border-2 rounded-xl text-base transition-all duration-200 outline-none border-surface-200 focus:border-primary-500 focus:shadow-[0_0_0_3px_rgba(22,163,74,0.15)]"
                />
              </div>

              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl">
                  <p className="text-sm text-red-600 font-medium">{error}</p>
                </div>
              )}

              {isSignUp && (
                <div className="p-3 bg-primary-50 border border-primary-200/60 rounded-xl">
                  <p className="text-xs text-primary-700 font-medium">After signing up, check your email to confirm your account, then log in.</p>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-primary-600 text-white font-semibold text-base rounded-xl hover:bg-primary-700 hover:shadow-elevated transition-all active:scale-[0.98] shadow-soft disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> {isSignUp ? 'Creating account...' : 'Signing in...'}</>
                ) : (
                  <>{isSignUp ? 'Create Account' : 'Sign In'} <ChevronRight className="w-4 h-4" /></>
                )}
              </button>

              <p className="text-sm text-center text-surface-500">
                {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
                <button
                  type="button"
                  onClick={() => { setIsSignUp(!isSignUp); setError(''); }}
                  className="text-primary-600 font-semibold hover:underline"
                >
                  {isSignUp ? 'Sign in' : 'Sign up'}
                </button>
              </p>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}

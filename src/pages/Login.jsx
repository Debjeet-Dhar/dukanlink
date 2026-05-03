import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { isSupabaseConfigured } from '../lib/supabase';
import { ChevronRight, Loader2, MessageCircle, Mail, ArrowLeft } from '../components/Icons';

function GoogleIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  );
}

export default function Login({ onBack }) {
  const { user, loading: authLoading, signIn, signUp, signInWithGoogle, resendConfirmation } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    if (authLoading || !user) return;
    const next = searchParams.get('next');
    const safe =
      next && next.startsWith('/') && !next.startsWith('//') ? next : null;
    navigate(safe || '/dashboard', { replace: true });
  }, [user, authLoading, navigate, searchParams]);
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);

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
      const { error: err, needsConfirmation } = await signUp(email.trim(), password);
      if (err) {
        setError(err);
      } else if (needsConfirmation) {
        setShowConfirmation(true);
      }
    } else {
      const { error: err, needsConfirmation } = await signIn(email.trim(), password);
      if (err) {
        setError(err);
        if (needsConfirmation) setShowConfirmation(true);
      }
    }
    setLoading(false);
  };

  const handleGoogle = async () => {
    setError('');
    setGoogleLoading(true);
    const { error: err } = await signInWithGoogle();
    if (err) setError(err);
    setGoogleLoading(false);
  };

  const handleResend = async () => {
    setResendLoading(true);
    setResendSuccess(false);
    setError('');
    const { error: err } = await resendConfirmation(email.trim());
    if (err) setError(err);
    else setResendSuccess(true);
    setResendLoading(false);
  };

  if (showConfirmation) {
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
                  <Mail className="w-6 h-6" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-primary-700 uppercase tracking-wide">Verify your email</p>
                  <p className="text-sm text-surface-700 mt-1 leading-snug">We sent a confirmation link to your inbox.</p>
                </div>
              </div>

              <div className="p-6 space-y-5">
                <div className="text-center">
                  <div className="w-16 h-16 bg-primary-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Mail className="w-8 h-8 text-primary-600" />
                  </div>
                  <h2 className="text-xl font-bold text-surface-900 mb-2">Check your email</h2>
                  <p className="text-sm text-surface-500">
                    We sent a verification link to <span className="font-semibold text-surface-700">{email}</span>
                  </p>
                </div>

                <div className="p-4 bg-amber-50 border border-amber-200/60 rounded-xl">
                  <p className="text-sm text-amber-700 font-medium">
                    Click the link in your email to verify your account, then come back and sign in.
                  </p>
                </div>

                {resendSuccess && (
                  <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl">
                    <p className="text-sm text-emerald-700 font-medium">Confirmation email resent! Check your inbox.</p>
                  </div>
                )}

                {error && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-xl">
                    <p className="text-sm text-red-600 font-medium">{error}</p>
                  </div>
                )}

                <button
                  onClick={handleResend}
                  disabled={resendLoading}
                  className="w-full py-3 bg-white border-2 border-surface-200 text-surface-700 font-semibold text-sm rounded-xl hover:bg-surface-50 hover:border-surface-300 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {resendLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Resend confirmation email'}
                </button>

                <button
                  onClick={() => { setShowConfirmation(false); setIsSignUp(false); setError(''); }}
                  className="w-full py-3 bg-primary-600 text-white font-semibold text-base rounded-xl hover:bg-primary-700 hover:shadow-elevated transition-all active:scale-[0.98] shadow-soft flex items-center justify-center gap-2"
                >
                  I verified my email -- Sign In <ChevronRight className="w-4 h-4" />
                </button>

                <button
                  onClick={() => { setShowConfirmation(false); setError(''); }}
                  className="w-full text-sm text-surface-500 hover:text-surface-700 transition-colors flex items-center justify-center gap-1"
                >
                  <ArrowLeft className="w-3.5 h-3.5" /> Back
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

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
          {!isSupabaseConfigured && (
            <div className="mb-4 p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-950 text-sm leading-snug">
              <p className="font-semibold mb-1">Connect Supabase to sign in</p>
              <p>Copy <code className="text-xs bg-amber-100/80 px-1 rounded">.env.example</code> to <code className="text-xs bg-amber-100/80 px-1 rounded">.env</code>, add your project URL and anon key from Supabase → Settings → API, then restart <code className="text-xs bg-amber-100/80 px-1 rounded">npm run dev</code>.</p>
            </div>
          )}
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
                  {isSignUp ? 'Sign up with email/password or Google to get started.' : 'Use email/password or Google to continue.'}
                </p>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div className="text-center">
                <h2 className="text-2xl sm:text-[26px] font-bold tracking-tight text-surface-900">
                  {isSignUp ? 'Sign Up' : 'Login'}
                </h2>
              </div>

              {/* Google Sign In */}
              <button
                type="button"
                onClick={handleGoogle}
                disabled={googleLoading}
                className="w-full py-3 bg-white border-2 border-surface-200 rounded-xl font-semibold text-base hover:bg-surface-50 hover:border-surface-300 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
              >
                {googleLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin text-surface-500" />
                ) : (
                  <GoogleIcon className="w-5 h-5" />
                )}
                Continue with Google
              </button>

              {/* Divider */}
              <div className="flex items-center gap-3">
                <div className="flex-1 h-px bg-surface-200" />
                <span className="text-xs text-surface-400 font-medium">or use email</span>
                <div className="flex-1 h-px bg-surface-200" />
              </div>

              {/* Email/Password Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
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
                    <p className="text-xs text-primary-700 font-medium">
                      You'll receive a verification email. Click the link to confirm your account, then sign in.
                    </p>
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
              </form>

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
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

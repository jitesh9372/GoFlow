import React, { useState } from 'react';
import { Link, useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Mail,
  Lock,
  AlertCircle,
  ArrowRight,
  Loader2,
  CheckCircle2,
  Train,
  Eye,
  EyeOff,
  Shield,
  User,
  ShieldCheck
} from 'lucide-react';
import { useAuth, formatAuthError } from '../../context/AuthContext';
import { TransitAuthVisual } from '../../components/TransitAuthVisual';
import { TiltCard } from '../../components/TiltCard';

export const SignInPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();

  const initialTab = searchParams.get('tab') === 'admin' ? 'admin' : 'passenger';
  const [authMode, setAuthMode] = useState<'passenger' | 'admin'>(initialTab);

  const { signInWithEmail, resetPassword } = useAuth();

  // ONLY Email and Password in Sign In as requested
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Status & Error
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Forgot Password modal state
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetSuccess, setResetSuccess] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const [resetError, setResetError] = useState<string | null>(null);

  // Validation
  const [touched, setTouched] = useState({ email: false, password: false });
  // Allow admin@123 as valid email input alongside standard emails
  const isEmailValidFormat = (val: string) => {
    const trimmed = val.trim().toLowerCase();
    if (trimmed === 'admin@123') return true;
    return val.includes('@') && val.trim().length >= 4;
  };
  const emailInvalid = touched.email && (!email || !isEmailValidFormat(email));
  const passwordInvalid = touched.password && !password;

  const handleTabSwitch = (mode: 'passenger' | 'admin') => {
    if (authMode === mode) return;
    setAuthMode(mode);
    setSearchParams(mode === 'admin' ? { tab: 'admin' } : {});
    setError(null);
    setTouched({ email: false, password: false });
    // Reset inputs on mode switch for clarity
    setEmail('');
    setPassword('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched({ email: true, password: true });

    if (!email || !password || emailInvalid) {
      setError('Please enter a valid email and password.');
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const trimmedEmail = email.trim();

      // If user is on the Admin Login tab, ensure they authenticate as admin
      if (authMode === 'admin') {
        const lowerEmail = trimmedEmail.toLowerCase();
        if (
          (lowerEmail !== 'admin@123' && lowerEmail !== 'admin@gmail.com') ||
          (password !== 'admin#1234' && password !== 'admin#123')
        ) {
          setError('Email or password is incorrect');
          setLoading(false);
          return;
        }
      }

      const profile = await signInWithEmail(trimmedEmail, password);

      // Routing logic:
      // Admins ALWAYS route to the Admin Dashboard (/admin)
      // Regular passengers route to user-facing pages (/passenger or previous route)
      if (profile.role === 'admin' || trimmedEmail.toLowerCase() === 'admin@123' || trimmedEmail.toLowerCase() === 'admin@gmail.com') {
        navigate('/admin', { replace: true });
      } else {
        const from = (location.state as any)?.from?.pathname;
        // Never send non-admins to admin routes even if they came from one
        if (from && !from.startsWith('/admin')) {
          navigate(from, { replace: true });
        } else {
          navigate('/passenger', { replace: true });
        }
      }
    } catch (err: any) {
      setError(formatAuthError(err));
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetEmail || !resetEmail.includes('@')) {
      setResetError('Please enter a valid email address.');
      return;
    }
    setResetError(null);
    setResetLoading(true);
    try {
      await resetPassword(resetEmail);
      setResetSuccess(true);
    } catch (err: any) {
      setResetError(formatAuthError(err));
    } finally {
      setResetLoading(false);
    }
  };


  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 sm:p-6 lg:p-8 bg-transit-bg">
      <div className="w-full max-w-5xl bg-white border border-transit-border rounded-2xl shadow-elevated overflow-hidden grid grid-cols-1 lg:grid-cols-12">

        {/* Left Side: Authentication Form */}
        <div className="lg:col-span-6 p-6 sm:p-10 flex flex-col justify-between">
          <TiltCard maxTilt={3} className="h-full flex flex-col justify-between">
            <div>
              {/* Header Badge */}
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2">
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-white shadow-xs transition-colors duration-300 ${
                    authMode === 'admin' ? 'bg-transit-navy' : 'bg-transit-teal'
                  }`}>
                    {authMode === 'admin' ? <Shield size={18} /> : <Train size={18} />}
                  </div>
                  <span className="font-bold text-base text-transit-navy tracking-tight">
                    GoFlow{' '}
                    <span className={`text-xs font-mono transition-colors duration-300 ${
                      authMode === 'admin' ? 'text-indigo-600' : 'text-transit-teal'
                    }`}>
                      {authMode === 'admin' ? 'ADMIN CONSOLE' : 'TRANSIT AUTH'}
                    </span>
                  </span>
                </div>

                <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                  Mumbai Transit
                </span>
              </div>

              {/* Smooth Animated Tab Switcher between User Login and Admin Login */}
              <div className="relative p-1 bg-slate-100 rounded-xl mb-6 flex border border-slate-200/80">
                <button
                  type="button"
                  id="tab-user-login"
                  onClick={() => handleTabSwitch('passenger')}
                  className={`relative z-10 flex-1 py-2 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-colors duration-200 ${
                    authMode === 'passenger' ? 'text-transit-navy' : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <User size={14} className={authMode === 'passenger' ? 'text-transit-teal' : ''} />
                  <span>User Login</span>
                </button>

                <button
                  type="button"
                  id="tab-admin-login"
                  onClick={() => handleTabSwitch('admin')}
                  className={`relative z-10 flex-1 py-2 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-colors duration-200 ${
                    authMode === 'admin' ? 'text-white' : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <Shield size={14} className={authMode === 'admin' ? 'text-teal-400' : ''} />
                  <span>Admin Login</span>
                </button>

                {/* Sliding indicator pill */}
                <motion.div
                  className={`absolute top-1 bottom-1 rounded-lg ${
                    authMode === 'passenger'
                      ? 'left-1 w-[calc(50%-4px)] bg-white shadow-2xs'
                      : 'left-[calc(50%+2px)] w-[calc(50%-4px)] bg-transit-navy shadow-sm'
                  }`}
                  layout
                  transition={{ type: 'spring', stiffness: 450, damping: 35 }}
                />
              </div>

              {/* Animated Form Content Transition */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={authMode}
                  initial={{ opacity: 0, x: authMode === 'admin' ? 14 : -14 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: authMode === 'admin' ? -14 : 14 }}
                  transition={{ duration: 0.2, ease: 'easeOut' }}
                >
                  {/* Mode Banner & Descriptions */}
                  {authMode === 'admin' ? (
                    <div className="mb-5 p-3 rounded-xl bg-slate-900 text-white flex items-start gap-2.5 shadow-sm border border-slate-800">
                      <ShieldCheck size={18} className="text-teal-400 shrink-0 mt-0.5" />
                      <div>
                        <div className="text-xs font-bold text-white flex items-center gap-1.5">
                          <span>Restricted Admin Portal</span>
                          <span className="text-[10px] font-mono bg-teal-400/20 text-teal-300 px-1.5 py-0.2 rounded border border-teal-400/30">
                            HIGH SECURITY
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-300 mt-0.5 leading-relaxed">
                          Authorized Mumbai transit controllers only. Direct access to lines, crowd sensors, and moderation.
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-1 mb-5">
                      <h1 className="text-2xl font-bold text-transit-navy tracking-tight">
                        Commuter Sign In
                      </h1>
                      <p className="text-xs text-transit-muted">
                        Access your passenger dashboard, saved routes, and live Mumbai crowd trackers.
                      </p>
                    </div>
                  )}

                  {/* Error Alert */}
                  {error && (
                    <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center justify-between gap-2 animate-fadeIn">
                      <div className="flex items-center gap-2">
                        <AlertCircle size={15} className="shrink-0" />
                        <span id="auth-error-message">{error}</span>
                      </div>
                      {error.includes('No account found') && (
                        <Link
                          to={`/signup?email=${encodeURIComponent(email)}`}
                          className="font-bold underline text-rose-900 hover:text-rose-950 shrink-0"
                        >
                          Sign Up Now →
                        </Link>
                      )}
                    </div>
                  )}

                  {/* Sign In Form - Only Email and Password */}
                  <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Email Field */}
                    <div>
                      <label className="block text-xs font-semibold text-transit-navy mb-1.5">
                        {authMode === 'admin' ? 'Admin Identifier / Email' : 'Email Address'}
                      </label>
                      <div className="relative">
                        <Mail
                          size={15}
                          className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                        />
                        <input
                          type="text"
                          id="input-email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          onBlur={() => setTouched((prev) => ({ ...prev, email: true }))}
                          placeholder={authMode === 'admin' ? 'admin@transit.gov.in' : 'user@example.com'}
                          className={`w-full pl-9 pr-3 py-2.5 rounded-xl border text-xs sm:text-sm bg-white transition-all outline-none focus:ring-2 ${
                            authMode === 'admin'
                              ? 'focus:ring-indigo-500/20 focus:border-transit-navy'
                              : 'focus:ring-transit-teal/20 focus:border-transit-teal'
                          } ${
                            emailInvalid
                              ? 'border-rose-300 focus:border-rose-500'
                              : 'border-slate-200'
                          }`}
                        />
                      </div>
                      {emailInvalid && (
                        <p className="text-[11px] text-rose-600 mt-1 font-medium">
                          Please enter a valid {authMode === 'admin' ? 'admin email or identifier' : 'email address'}.
                        </p>
                      )}
                    </div>

                    {/* Password Field */}
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="block text-xs font-semibold text-transit-navy">
                          Password
                        </label>
                        {authMode === 'passenger' && (
                          <button
                            type="button"
                            onClick={() => {
                              setResetEmail(email);
                              setShowForgotModal(true);
                            }}
                            className="text-xs text-transit-teal hover:underline font-medium"
                          >
                            Forgot password?
                          </button>
                        )}
                      </div>
                      <div className="relative">
                        <Lock
                          size={15}
                          className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                        />
                        <input
                          type={showPassword ? 'text' : 'password'}
                          id="input-password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          onBlur={() => setTouched((prev) => ({ ...prev, password: true }))}
                          placeholder="••••••••"
                          className={`w-full pl-9 pr-10 py-2.5 rounded-xl border text-xs sm:text-sm bg-white transition-all outline-none focus:ring-2 ${
                            authMode === 'admin'
                              ? 'focus:ring-indigo-500/20 focus:border-transit-navy'
                              : 'focus:ring-transit-teal/20 focus:border-transit-teal'
                          } ${
                            passwordInvalid
                              ? 'border-rose-300 focus:border-rose-500'
                              : 'border-slate-200'
                          }`}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                          tabIndex={-1}
                        >
                          {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                        </button>
                      </div>
                      {passwordInvalid && (
                        <p className="text-[11px] text-rose-600 mt-1 font-medium">
                          Password is required.
                        </p>
                      )}
                    </div>

                    {/* Submit Button */}
                    <button
                      type="submit"
                      id="btn-sign-in"
                      disabled={loading}
                      className={`w-full py-2.5 active:scale-[0.98] text-white text-xs sm:text-sm font-semibold rounded-xl flex items-center justify-center gap-2 shadow-xs transition-all disabled:opacity-50 ${
                        authMode === 'admin'
                          ? 'bg-transit-navy hover:bg-slate-800'
                          : 'bg-transit-teal hover:bg-transit-teal-hover'
                      }`}
                    >
                      {loading ? (
                        <>
                          <Loader2 size={16} className="animate-spin" />
                          <span>Authenticating credentials...</span>
                        </>
                      ) : (
                        <>
                          <span>
                            {authMode === 'admin'
                              ? 'Access Admin Dashboard'
                              : 'Sign In as Commuter'}
                          </span>
                          <ArrowRight size={14} />
                        </>
                      )}
                    </button>
                  </form>

                  {/* Switch hints */}
                  {authMode === 'admin' ? (
                    <div className="mt-4 p-2.5 bg-slate-50 border border-slate-200/90 rounded-xl flex items-center justify-between text-xs text-slate-500">
                      <span className="text-[11px] flex items-center gap-1.5 text-slate-600">
                        <Shield size={13} className="text-transit-navy shrink-0" />
                        <span>Restricted terminal &bull; Activity monitored</span>
                      </span>
                      <button
                        type="button"
                        onClick={() => handleTabSwitch('passenger')}
                        className="text-[11px] text-transit-teal hover:underline font-semibold"
                      >
                        Commuter Login &rarr;
                      </button>
                    </div>
                  ) : (
                    <div className="mt-4 p-2.5 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-between text-xs">
                      <span className="text-[11px] text-slate-500">
                        Transit operations controller?
                      </span>
                      <button
                        type="button"
                        onClick={() => handleTabSwitch('admin')}
                        className="text-[11px] text-transit-teal hover:underline font-semibold"
                      >
                        Switch to Admin Login &rarr;
                      </button>
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Footer link to Sign Up (Only for Commuters) */}
            <div className="pt-6 mt-6 border-t border-slate-100 text-center text-xs text-transit-muted">
              Don&apos;t have a commuter account yet?{' '}
              <Link
                to="/signup"
                id="link-to-signup"
                className="font-semibold text-transit-teal hover:underline ml-1"
              >
                Sign up for free
              </Link>
            </div>
          </TiltCard>
        </div>

        {/* Right Side: Animated Visual */}
        <div className="hidden lg:block lg:col-span-6 bg-slate-50">
          <TransitAuthVisual />
        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-card border border-transit-border p-6 max-w-md w-full shadow-elevated animate-scaleIn">
            <h3 className="font-bold text-base text-transit-navy mb-1.5">
              Reset Your Password
            </h3>
            <p className="text-xs text-slate-600 mb-4 leading-relaxed">
              Enter your registered commuter email address to receive a secure link to reset your password.
            </p>

            {resetSuccess ? (
              <div className="space-y-4">
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-transit text-emerald-800 text-xs flex items-start gap-2">
                  <CheckCircle2 size={16} className="text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold">Password reset email dispatched!</p>
                    <p className="mt-0.5 text-[11px] text-emerald-700">
                      Check your inbox at <strong>{resetEmail}</strong> for instructions.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setShowForgotModal(false);
                    setResetSuccess(false);
                  }}
                  className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-transit transition-colors"
                >
                  Close
                </button>
              </div>
            ) : (
              <form onSubmit={handlePasswordResetSubmit} className="space-y-4">
                {resetError && (
                  <div className="p-2.5 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded flex items-center gap-2">
                    <AlertCircle size={14} className="shrink-0" />
                    <span>{resetError}</span>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-transit-navy mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    placeholder="user@example.com"
                    className="w-full px-3 py-2 text-xs rounded-transit border border-slate-200 focus:border-transit-teal outline-none"
                    autoFocus
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowForgotModal(false)}
                    className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-transit transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={resetLoading}
                    className="px-4 py-1.5 bg-transit-teal hover:bg-transit-teal-hover text-white text-xs font-semibold rounded-transit flex items-center gap-1.5 transition-colors disabled:opacity-50"
                  >
                    {resetLoading ? (
                      <>
                        <Loader2 size={13} className="animate-spin" />
                        <span>Sending...</span>
                      </>
                    ) : (
                      <span>Send Reset Link</span>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

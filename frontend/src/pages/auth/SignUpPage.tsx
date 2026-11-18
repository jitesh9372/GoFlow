import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { User, Mail, Lock, AlertCircle, ArrowRight, Loader2, Check, Train } from 'lucide-react';
import { useAuth, formatAuthError } from '../../context/AuthContext';
import { TransitAuthVisual } from '../../components/TransitAuthVisual';
import { TiltCard } from '../../components/TiltCard';

export const SignUpPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { signUpWithEmail, signInWithGoogle } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState(searchParams.get('email') || '');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Field touch tracking for inline validation
  const [touched, setTouched] = useState({
    name: false,
    email: false,
    password: false,
    confirmPassword: false
  });

  // Validation rules
  const nameInvalid = touched.name && name.trim().length < 2;
  const emailInvalid = touched.email && (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email));
  const passwordInvalid = touched.password && password.length < 6;
  const confirmInvalid = touched.confirmPassword && (confirmPassword !== password || !confirmPassword);

  // Password strength calculation
  const hasMinLength = password.length >= 6;
  const hasNumber = /\d/.test(password);
  const hasLetter = /[a-zA-Z]/.test(password);
  const strengthScore = [hasMinLength, hasNumber, hasLetter].filter(Boolean).length;

  const strengthLabel = strengthScore === 3 ? 'Strong' : strengthScore === 2 ? 'Medium' : 'Weak';
  const strengthColor =
    strengthScore === 3
      ? 'bg-emerald-500'
      : strengthScore === 2
      ? 'bg-amber-500'
      : 'bg-rose-400';

  const isFormValid =
    name.trim().length >= 2 &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) &&
    password.length >= 6 &&
    password === confirmPassword;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched({ name: true, email: true, password: true, confirmPassword: true });

    if (!isFormValid) {
      setError('Please review the form errors before submitting.');
      return;
    }

    if (email.trim().toLowerCase() === 'admin@gmail.com') {
      setError('admin@gmail.com is reserved for administrator login. Please sign in with your secret credentials on the Sign In page.');
      return;
    }

    setError(null);
    setLoading(true);
    try {
      // Role is passenger - securely handled on backend, no admin option
      await signUpWithEmail(email, password, name.trim(), 'passenger');
      navigate('/passenger', { replace: true });
    } catch (err: any) {
      setError(formatAuthError(err));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    setError(null);
    setGoogleLoading(true);
    try {
      await signInWithGoogle();
      navigate('/passenger', { replace: true });
    } catch (err: any) {
      setError(formatAuthError(err));
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 sm:p-6 lg:p-8 bg-transit-bg">
      <div className="w-full max-w-5xl bg-white border border-transit-border rounded-2xl shadow-elevated overflow-hidden grid grid-cols-1 lg:grid-cols-12">
        {/* Left Side: Sign Up Form with 3D Tilt Wrapper */}
        <div className="lg:col-span-6 p-6 sm:p-10 flex flex-col justify-between">
          <TiltCard maxTilt={5} className="h-full flex flex-col justify-between">
            <div>
              {/* Brand Header */}
              <div className="flex items-center gap-2 mb-6">
                <div className="w-8 h-8 rounded-transit bg-transit-teal flex items-center justify-center text-white shadow-xs">
                  <Train size={18} />
                </div>
                <span className="font-bold text-base text-transit-navy tracking-tight">
                  GoFlow <span className="text-transit-teal text-xs font-mono">JOIN</span>
                </span>
              </div>

              <div className="space-y-1.5 mb-5">
                <h1 className="text-2xl sm:text-3xl font-bold text-transit-navy tracking-tight">
                  Create your account
                </h1>
                <p className="text-xs sm:text-sm text-transit-muted">
                  Join thousands of Mumbai commuters navigating with real-time crowd intelligence.
                </p>
              </div>

              {error && (
                <div className="mb-4 p-3 rounded-transit bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2 animate-fadeIn">
                  <AlertCircle size={15} className="shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              {/* Continue with Google */}
              <div className="mb-4">
                <button
                  type="button"
                  id="btn-google-signup"
                  onClick={handleGoogleSignUp}
                  disabled={loading || googleLoading}
                  className="w-full py-2.5 px-4 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs sm:text-sm font-semibold rounded-xl flex items-center justify-center gap-2.5 shadow-2xs hover:shadow-xs transition-all active:scale-[0.98] disabled:opacity-50"
                >
                  {googleLoading ? (
                    <>
                      <Loader2 size={16} className="animate-spin text-transit-teal" />
                      <span>Connecting to Google...</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                        <path
                          fill="#4285F4"
                          d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
                        />
                        <path
                          fill="#34A853"
                          d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
                        />
                        <path
                          fill="#FBBC05"
                          d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                        />
                        <path
                          fill="#EA4335"
                          d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                        />
                      </svg>
                      <span>Sign up with Google</span>
                    </>
                  )}
                </button>

                <div className="relative my-3.5 flex items-center justify-center">
                  <div className="border-t border-slate-200 w-full" />
                  <span className="bg-white px-2.5 text-[11px] uppercase tracking-wider text-slate-400 font-medium whitespace-nowrap">
                    or register with email
                  </span>
                  <div className="border-t border-slate-200 w-full" />
                </div>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-3.5">
                {/* Full Name */}
                <div>
                  <label className="block text-xs font-semibold text-transit-navy mb-1">
                    Full Name
                  </label>
                  <div className="relative">
                    <User
                      size={15}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                    />
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      onBlur={() => setTouched((prev) => ({ ...prev, name: true }))}
                      placeholder="e.g. Rohan Sharma"
                      className={`w-full pl-9 pr-3 py-2 rounded-transit border text-xs sm:text-sm bg-white transition-all outline-none focus:ring-2 focus:ring-transit-teal/20 ${
                        nameInvalid
                          ? 'border-rose-300 focus:border-rose-500'
                          : 'border-slate-200 focus:border-transit-teal'
                      }`}
                    />
                  </div>
                  {nameInvalid && (
                    <p className="text-[11px] text-rose-600 mt-1 font-medium">
                      Please enter your name (min 2 characters).
                    </p>
                  )}
                </div>

                {/* Email Address */}
                <div>
                  <label className="block text-xs font-semibold text-transit-navy mb-1">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail
                      size={15}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                    />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      onBlur={() => setTouched((prev) => ({ ...prev, email: true }))}
                      placeholder="name@example.com"
                      className={`w-full pl-9 pr-3 py-2 rounded-transit border text-xs sm:text-sm bg-white transition-all outline-none focus:ring-2 focus:ring-transit-teal/20 ${
                        emailInvalid
                          ? 'border-rose-300 focus:border-rose-500'
                          : 'border-slate-200 focus:border-transit-teal'
                      }`}
                    />
                  </div>
                  {emailInvalid && (
                    <p className="text-[11px] text-rose-600 mt-1 font-medium">
                      Please enter a valid email address.
                    </p>
                  )}
                </div>

                {/* Password & Confirm Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-transit-navy mb-1">
                      Password
                    </label>
                    <div className="relative">
                      <Lock
                        size={15}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                      />
                      <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        onBlur={() => setTouched((prev) => ({ ...prev, password: true }))}
                        placeholder="••••••••"
                        className={`w-full pl-9 pr-3 py-2 rounded-transit border text-xs sm:text-sm bg-white transition-all outline-none focus:ring-2 focus:ring-transit-teal/20 ${
                          passwordInvalid
                            ? 'border-rose-300 focus:border-rose-500'
                            : 'border-slate-200 focus:border-transit-teal'
                        }`}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-transit-navy mb-1">
                      Confirm Password
                    </label>
                    <div className="relative">
                      <Lock
                        size={15}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                      />
                      <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        onBlur={() => setTouched((prev) => ({ ...prev, confirmPassword: true }))}
                        placeholder="••••••••"
                        className={`w-full pl-9 pr-3 py-2 rounded-transit border text-xs sm:text-sm bg-white transition-all outline-none focus:ring-2 focus:ring-transit-teal/20 ${
                          confirmInvalid
                            ? 'border-rose-300 focus:border-rose-500'
                            : 'border-slate-200 focus:border-transit-teal'
                        }`}
                      />
                    </div>
                  </div>
                </div>

                {/* Inline Errors & Strength meter */}
                {password && (
                  <div className="space-y-1.5 pt-0.5">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-500">Password strength:</span>
                      <span className="font-semibold text-slate-700">{strengthLabel}</span>
                    </div>
                    <div className="w-full h-1 bg-slate-100 rounded-full overflow-hidden flex gap-1">
                      <div
                        className={`h-full flex-1 rounded-full ${
                          strengthScore >= 1 ? strengthColor : 'bg-slate-200'
                        }`}
                      />
                      <div
                        className={`h-full flex-1 rounded-full ${
                          strengthScore >= 2 ? strengthColor : 'bg-slate-200'
                        }`}
                      />
                      <div
                        className={`h-full flex-1 rounded-full ${
                          strengthScore >= 3 ? strengthColor : 'bg-slate-200'
                        }`}
                      />
                    </div>
                    <p className="text-[10px] text-slate-500">
                      Use 6+ characters with a mix of letters and numbers.
                    </p>
                  </div>
                )}

                {confirmInvalid && (
                  <p className="text-[11px] text-rose-600 font-medium">
                    Passwords do not match.
                  </p>
                )}

                {/* Primary Sign Up Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full mt-2 py-2.5 bg-transit-teal hover:bg-transit-teal-hover active:scale-[0.98] text-white text-xs sm:text-sm font-semibold rounded-transit flex items-center justify-center gap-2 shadow-xs transition-all disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      <span>Creating commuter account...</span>
                    </>
                  ) : (
                    <>
                      <span>Create Account</span>
                      <ArrowRight size={14} />
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* Footer link to Sign In */}
            <div className="pt-5 mt-5 border-t border-slate-100 text-center text-xs text-transit-muted">
              Already have a GoFlow account?{' '}
              <Link
                to="/signin"
                className="font-semibold text-transit-teal hover:underline ml-1"
              >
                Sign in
              </Link>
            </div>
          </TiltCard>
        </div>

        {/* Right Side: Animated Visual */}
        <div className="hidden lg:block lg:col-span-6 bg-slate-50">
          <TransitAuthVisual />
        </div>
      </div>
    </div>
  );
};

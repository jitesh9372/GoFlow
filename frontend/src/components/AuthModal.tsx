import React, { useState } from 'react';
import { X, Lock, Mail, User, Shield, AlertCircle, ArrowRight, Train, Phone, KeyRound, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth, formatAuthError } from '../context/AuthContext';
import { UserRole } from '../types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultRole?: UserRole;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  defaultRole = 'passenger'
}) => {
  const navigate = useNavigate();
  const { signInWithEmail, authenticatePassenger, isFirebaseActive } = useAuth();

  const [authRole, setAuthRole] = useState<'passenger' | 'admin'>(defaultRole);

  // Passenger state
  const [passengerName, setPassengerName] = useState('');
  const [passengerPhone, setPassengerPhone] = useState('');

  // Admin state
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (authRole === 'passenger') {
        if (!passengerName.trim()) {
          throw new Error('Please enter your full passenger name');
        }
        const cleanDigits = passengerPhone.replace(/\D/g, '');
        if (cleanDigits.length < 10) {
          throw new Error('Please enter a valid 10-digit mobile number');
        }
        await authenticatePassenger({
          fullName: passengerName.trim(),
          phone: passengerPhone.trim()
        });
        onClose();
        navigate('/passenger');
      } else {
        if (!adminEmail.trim() || !adminPassword.trim()) {
          throw new Error('Please enter both admin email and password');
        }
        await signInWithEmail(adminEmail, adminPassword);
        onClose();
        navigate('/admin');
      }
    } catch (err: any) {
      setError(formatAuthError(err));
    } finally {
      setLoading(false);
    }
  };

  const fillAdminCredentials = () => {
    setAdminEmail('admin@gmail.com');
    setAdminPassword('admin#123');
    setError(null);
  };

  const fillPassengerDetails = () => {
    setPassengerName('Jitesh Kanojiya');
    setPassengerPhone('9876543210');
    setError(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl border border-transit-border shadow-elevated w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-transit-navy text-white px-6 py-4 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-transit-teal flex items-center justify-center">
              <Train size={18} className="text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-base leading-tight">GoFlow Mumbai</h3>
              <p className="text-[11px] text-slate-300 font-mono">Two-Rule Authentication</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-6">
          {/* Dual Role Selector Tabs */}
          <div className="bg-slate-100 p-1 rounded-xl grid grid-cols-2 gap-1 mb-5 border border-slate-200">
            <button
              type="button"
              onClick={() => {
                setAuthRole('passenger');
                setError(null);
              }}
              className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-semibold transition-all ${
                authRole === 'passenger'
                  ? 'bg-white text-transit-teal shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <User size={13} />
              <span>Passenger Details</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setAuthRole('admin');
                setError(null);
              }}
              className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-semibold transition-all ${
                authRole === 'admin'
                  ? 'bg-transit-navy text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Shield size={13} />
              <span>Admin Login</span>
            </button>
          </div>

          {error && (
            <div className="mb-4 p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2">
              <AlertCircle size={15} className="shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {authRole === 'passenger' ? (
            /* 1. Passenger Details Form */
            <form onSubmit={handleSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Passenger Full Name
                </label>
                <div className="relative">
                  <User size={15} className="absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={passengerName}
                    onChange={(e) => setPassengerName(e.target.value)}
                    placeholder="e.g. Jitesh Kanojiya"
                    className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-transit-teal"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Mobile Number
                </label>
                <div className="relative flex">
                  <span className="inline-flex items-center px-2.5 rounded-l-xl border border-r-0 border-slate-200 bg-slate-50 text-slate-600 text-xs font-medium">
                    +91
                  </span>
                  <input
                    type="tel"
                    required
                    value={passengerPhone}
                    onChange={(e) => setPassengerPhone(e.target.value)}
                    placeholder="98765 43210"
                    maxLength={10}
                    className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-200 rounded-r-xl focus:outline-none focus:ring-1 focus:ring-transit-teal"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <button
                  type="button"
                  onClick={fillPassengerDetails}
                  className="text-[11px] text-transit-teal hover:underline font-semibold flex items-center gap-1"
                >
                  <Sparkles size={12} />
                  <span>Autofill Passenger</span>
                </button>
                <span className="text-[10px] text-slate-400 font-mono">No password needed</span>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 py-2.5 px-4 bg-transit-teal hover:bg-transit-teal-hover text-white text-xs sm:text-sm font-semibold rounded-xl flex items-center justify-center gap-2 transition-all shadow-xs disabled:opacity-50"
              >
                <span>{loading ? 'Authenticating...' : 'Continue as Passenger'}</span>
                <ArrowRight size={15} />
              </button>
            </form>
          ) : (
            /* 2. Admin Login Form */
            <form onSubmit={handleSubmit} className="space-y-3.5">
              <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-bold text-slate-700">Official Admin Credentials</p>
                  <p className="text-[10px] text-slate-500 font-mono">admin@gmail.com &bull; admin#1234</p>
                </div>
                <button
                  type="button"
                  onClick={fillAdminCredentials}
                  className="px-2 py-0.5 text-[10px] font-semibold bg-white border border-slate-200 hover:bg-slate-100 rounded-md text-slate-700 shadow-2xs flex items-center gap-1"
                >
                  <KeyRound size={11} className="text-transit-teal" />
                  <span>Fill</span>
                </button>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Admin Email
                </label>
                <div className="relative">
                  <Mail size={15} className="absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type="email"
                    required
                    value={adminEmail}
                    onChange={(e) => setAdminEmail(e.target.value)}
                    placeholder="admin@gmail.com"
                    className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-transit-teal"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Admin Password
                </label>
                <div className="relative">
                  <Lock size={15} className="absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type="password"
                    required
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    placeholder="admin#1234"
                    className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-transit-teal"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 py-2.5 px-4 bg-transit-navy hover:bg-slate-800 text-white text-xs sm:text-sm font-semibold rounded-xl flex items-center justify-center gap-2 transition-all shadow-xs disabled:opacity-50"
              >
                <Shield size={14} />
                <span>{loading ? 'Verifying Admin...' : 'Authenticate as Admin'}</span>
              </button>
            </form>
          )}

          {!isFirebaseActive && (
            <p className="text-[11px] text-slate-400 text-center mt-4">
              Running with in-memory auth simulation.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

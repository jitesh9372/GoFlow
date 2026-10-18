import React, { useState } from 'react';
import {
  User,
  ShieldCheck,
  Mail,
  Bookmark,
  LogOut,
  Check,
  Train,
  Settings,
  Bell,
  MapPin,
  ArrowRight,
  Edit3,
  Star
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';

export const PassengerProfilePage: React.FC = () => {
  const { user, signOut, refreshProfile } = useAuth();
  const navigate = useNavigate();

  const [savedSuccess, setSavedSuccess] = useState(false);
  const [preferredCoach, setPreferredCoach] = useState('general');
  const [preferCrowd, setPreferCrowd] = useState('comfort');

  const handleSavePreferences = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const initials = user?.displayName
    ? user.displayName.slice(0, 2).toUpperCase()
    : 'P';

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Profile Header */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="bg-white border border-transit-border rounded-card p-6 shadow-card"
      >
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
          {/* Avatar */}
          <div className="relative shrink-0">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-teal-400 to-teal-700 text-white font-extrabold text-xl flex items-center justify-center shadow-md">
              {initials}
            </div>
            <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 border-2 border-white flex items-center justify-center">
              <span className="w-2 h-2 rounded-full bg-white" />
            </span>
          </div>

          {/* User Info */}
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-bold text-transit-navy tracking-tight truncate">
              {user?.displayName || 'Mumbai Commuter'}
            </h1>
            <p className="text-sm text-slate-500 flex items-center gap-1.5 mt-0.5">
              <Mail size={13} />
              <span className="truncate">{user?.email || 'commuter@goflow.mumbai'}</span>
            </p>
            <div className="flex flex-wrap items-center gap-2 mt-2">
              <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 font-mono font-semibold capitalize">
                <ShieldCheck size={11} /> {user?.role || 'passenger'}
              </span>
              <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full bg-teal-50 text-transit-teal border border-teal-200 font-mono font-semibold">
                <Train size={11} /> Mumbai Commuter
              </span>
              <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200 font-mono">
                <Bookmark size={11} /> {user?.savedRoutes?.length || 0} Saved Routes
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 shrink-0">
            <Link
              to="/saved"
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-transit flex items-center gap-1.5 transition-colors"
            >
              <Bookmark size={13} />
              <span>Saved</span>
            </Link>
            <button
              onClick={async () => {
                await signOut();
                navigate('/');
              }}
              className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-semibold rounded-transit flex items-center gap-1.5 transition-colors"
            >
              <LogOut size={13} />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Stats */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.05 }}
          className="lg:col-span-1 space-y-4"
        >
          {/* Quick Links */}
          <div className="bg-white border border-transit-border rounded-card p-5 shadow-subtle space-y-2">
            <h3 className="text-sm font-bold text-transit-navy mb-3">Quick Navigation</h3>
            {[
              { label: 'Plan Commute', desc: 'Multi-modal routing', to: '/routes', icon: Train, color: 'text-transit-teal bg-teal-50' },
              { label: 'Live Crowd Map', desc: 'Station occupancy', to: '/map', icon: MapPin, color: 'text-rose-700 bg-rose-50' },
              { label: 'Peak Timings', desc: 'Quiet hour windows', to: '/timings', icon: Star, color: 'text-amber-700 bg-amber-50' },
              { label: 'Report Rush', desc: 'Submit crowd data', to: '/report', icon: Bell, color: 'text-sky-700 bg-sky-50' },
            ].map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className="flex items-center gap-3 p-2.5 rounded-transit border border-slate-100 hover:border-slate-200 hover:bg-slate-50/60 transition-colors group"
              >
                <span className={`w-7 h-7 rounded flex items-center justify-center shrink-0 ${item.color}`}>
                  <item.icon size={14} />
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-transit-navy">{item.label}</p>
                  <p className="text-[11px] text-slate-500">{item.desc}</p>
                </div>
                <ArrowRight size={13} className="text-slate-300 group-hover:text-slate-500 group-hover:translate-x-0.5 transition-all" />
              </Link>
            ))}
          </div>

          {/* Account Security */}
          <div className="bg-white border border-transit-border rounded-card p-4 shadow-subtle">
            <h3 className="text-xs font-bold text-transit-navy uppercase tracking-wider mb-3">Account Security</h3>
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Firebase Auth</span>
                <span className="text-emerald-700 font-semibold flex items-center gap-1">
                  <ShieldCheck size={12} /> Active
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Session Type</span>
                <span className="text-slate-700 font-mono">Persistent</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Member Since</span>
                <span className="text-slate-700 font-mono">
                  {user?.createdAt
                    ? new Date(user.createdAt).toLocaleDateString([], { month: 'short', year: 'numeric' })
                    : 'Recently'}
                </span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Preferences Form */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="lg:col-span-2"
        >
          <div className="bg-white border border-transit-border rounded-card p-6 shadow-subtle">
            <div className="flex items-center justify-between mb-5 border-b border-slate-100 pb-4">
              <div>
                <h2 className="font-bold text-base text-transit-navy flex items-center gap-2">
                  <Settings size={16} className="text-transit-teal" />
                  Commute Preferences
                </h2>
                <p className="text-xs text-transit-muted mt-0.5">
                  Personalize route recommendations and crowd sensitivity.
                </p>
              </div>
              {savedSuccess && (
                <span className="text-xs text-emerald-700 font-semibold flex items-center gap-1 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                  <Check size={12} /> Saved!
                </span>
              )}
            </div>

            <form onSubmit={handleSavePreferences} className="space-y-5">
              {/* Preferred Coach */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                  Preferred Train Compartment
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { value: 'general', label: 'General Class', sub: '2nd class / standard' },
                    { value: 'ladies', label: 'Ladies Compartment', sub: 'Reserved seating' },
                    { value: 'first_class', label: 'First Class', sub: 'Premium travel' },
                    { value: 'ac', label: 'AC Local', sub: 'Air conditioned' },
                  ].map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setPreferredCoach(opt.value)}
                      className={`text-left p-3 rounded-transit border transition-all ${
                        preferredCoach === opt.value
                          ? 'border-transit-teal bg-teal-50/60 text-transit-teal'
                          : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-600'
                      }`}
                    >
                      <p className="text-xs font-semibold leading-tight">{opt.label}</p>
                      <p className="text-[11px] opacity-75 mt-0.5">{opt.sub}</p>
                    </button>
                  ))}
                </div>
                <p className="text-[11px] text-slate-400 mt-1.5">
                  Route planner will prioritize crowd calculations for your selected coach.
                </p>
              </div>

              {/* Commute Corridor */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                  Primary Commute Corridor
                </label>
                <select className="w-full px-3 py-2.5 border border-slate-200 rounded-transit text-sm text-slate-800 focus:outline-none focus:ring-1 focus:ring-transit-teal bg-white">
                  <option>Western Line (Churchgate – Virar – Dahanu)</option>
                  <option>Central Main Line (CSMT – Dadar – Thane – Kalyan)</option>
                  <option>Harbour Line (CSMT – Kurla – Vashi – Panvel)</option>
                  <option>Mumbai Metro Line 1 & 3 (East-West & Aqua Line)</option>
                </select>
              </div>

              {/* Crowd Sensitivity */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                  Crowd Sensitivity Preference
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setPreferCrowd('comfort')}
                    className={`text-left p-3.5 rounded-transit border transition-all ${
                      preferCrowd === 'comfort'
                        ? 'border-emerald-500 bg-emerald-50/60 text-emerald-900'
                        : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-600'
                    }`}
                  >
                    <p className="text-xs font-bold">Prioritize Comfort</p>
                    <p className="text-[11px] mt-0.5 opacity-75">Least crowded route even if 5–10 mins longer</p>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreferCrowd('speed')}
                    className={`text-left p-3.5 rounded-transit border transition-all ${
                      preferCrowd === 'speed'
                        ? 'border-transit-teal bg-teal-50/60 text-transit-teal'
                        : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-600'
                    }`}
                  >
                    <p className="text-xs font-bold">Prioritize Speed</p>
                    <p className="text-[11px] mt-0.5 opacity-75">Fastest route regardless of rush load</p>
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-transit-teal hover:bg-transit-teal-hover text-white font-semibold text-sm rounded-transit shadow-xs transition-colors flex items-center justify-center gap-2"
              >
                <Check size={15} />
                Save Commute Preferences
              </button>
            </form>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

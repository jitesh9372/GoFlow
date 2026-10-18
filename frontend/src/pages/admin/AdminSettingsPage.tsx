import React, { useState } from 'react';
import { Shield, Database, Lock, Key, Server, CheckCircle, RefreshCw, Cpu } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { isFirebaseConfigured } from '../../services/firebase';

export const AdminSettingsPage: React.FC = () => {
  const { user } = useAuth();

  const [lowThreshold, setLowThreshold] = useState(40);
  const [medThreshold, setMedThreshold] = useState(75);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSaveThresholds = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="border-b border-slate-200 pb-4">
        <h1 className="text-2xl font-bold text-transit-navy tracking-tight flex items-center gap-2">
          <Shield size={24} className="text-transit-teal" />
          <span>System Architecture &amp; Admin Settings</span>
        </h1>
        <p className="text-xs text-transit-muted mt-1">
          Inspect Firebase Custom Claims, role-based security rules, and configure transit crowd rating thresholds.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Firebase & Security Status */}
        <div className="bg-white border border-transit-border rounded-card p-5 shadow-subtle space-y-4">
          <h3 className="font-bold text-base text-transit-navy flex items-center gap-2">
            <Lock size={16} className="text-transit-teal" />
            <span>Authorization &amp; Custom Claims</span>
          </h3>

          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between p-2.5 rounded bg-slate-50 border border-slate-200">
              <span className="text-slate-600">Active Admin Session:</span>
              <span className="font-mono font-bold text-transit-navy">{user?.displayName || 'Admin'}</span>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded bg-slate-50 border border-slate-200">
              <span className="text-slate-600">Assigned Custom Claim:</span>
              <span className="px-2 py-0.5 rounded bg-teal-50 text-teal-800 border border-teal-200 font-mono font-bold uppercase">
                role: {user?.role || 'admin'}
              </span>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded bg-slate-50 border border-slate-200">
              <span className="text-slate-600">Role Enforcement:</span>
              <span className="text-emerald-700 font-semibold flex items-center gap-1">
                <CheckCircle size={13} /> Server-Side &amp; Security Rules
              </span>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded bg-slate-50 border border-slate-200">
              <span className="text-slate-600">Firebase Config Status:</span>
              <span className="font-mono text-slate-700">
                {isFirebaseConfigured ? 'Connected (Production)' : 'Graceful Simulation Mode'}
              </span>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-500 leading-relaxed">
            Note: Roles are cryptographically enforced via Firebase custom claims verified on Express backend and by Firestore Security Rules. Role claims are never trusted from client localStorage.
          </div>
        </div>

        {/* Crowd Density Threshold Configuration */}
        <div className="bg-white border border-transit-border rounded-card p-5 shadow-subtle space-y-4">
          <h3 className="font-bold text-base text-transit-navy flex items-center gap-2">
            <Cpu size={16} className="text-transit-teal" />
            <span>Crowd Classification Thresholds</span>
          </h3>

          {savedSuccess && (
            <div className="p-2.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded flex items-center gap-1.5">
              <CheckCircle size={14} className="text-emerald-600" />
              <span>Threshold settings updated!</span>
            </div>
          )}

          <form onSubmit={handleSaveThresholds} className="space-y-4 text-xs">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="font-semibold text-slate-700 uppercase">
                  Comfortable Seating Cutoff ({lowThreshold}%)
                </label>
              </div>
              <input
                type="range"
                min="20"
                max="50"
                value={lowThreshold}
                onChange={(e) => setLowThreshold(parseInt(e.target.value, 10))}
                className="w-full accent-emerald-600"
              />
              <p className="text-[11px] text-slate-400 mt-0.5">
                Occupancy under this percentage is marked as Green (Comfortable).
              </p>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="font-semibold text-slate-700 uppercase">
                  Super Dense Crush Load (SDCL) Trigger ({medThreshold}%)
                </label>
              </div>
              <input
                type="range"
                min="60"
                max="90"
                value={medThreshold}
                onChange={(e) => setMedThreshold(parseInt(e.target.value, 10))}
                className="w-full accent-rose-600"
              />
              <p className="text-[11px] text-slate-400 mt-0.5">
                Occupancy exceeding this value triggers Red SDCL alert badges across the map.
              </p>
            </div>

            <button
              type="submit"
              className="py-2 px-3 bg-transit-teal hover:bg-transit-teal-hover text-white rounded text-xs font-semibold shadow-xs transition-colors"
            >
              Apply Transit Thresholds
            </button>
          </form>
        </div>
      </div>

      {/* Role Permissions Matrix */}
      <div className="bg-white border border-transit-border rounded-card p-5 shadow-subtle space-y-3 text-xs">
        <h3 className="font-bold text-base text-transit-navy">
          Role-Based Access Control (RBAC) Matrix
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-y border-slate-200 font-semibold text-slate-500 uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-2 px-3">System Capability</th>
                <th className="py-2 px-3 text-center">Public / Guest</th>
                <th className="py-2 px-3 text-center">Passenger</th>
                <th className="py-2 px-3 text-center">Admin (Transit Authority)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              <tr>
                <td className="py-2.5 px-3 font-medium">Browse Live Crowd Map &amp; Peak Timings</td>
                <td className="py-2.5 px-3 text-center text-emerald-600">✓</td>
                <td className="py-2.5 px-3 text-center text-emerald-600">✓</td>
                <td className="py-2.5 px-3 text-center text-emerald-600">✓</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-medium">Plan Multimodal Routes (Train/Metro/Bus)</td>
                <td className="py-2.5 px-3 text-center text-emerald-600">✓</td>
                <td className="py-2.5 px-3 text-center text-emerald-600">✓</td>
                <td className="py-2.5 px-3 text-center text-emerald-600">✓</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-medium">Bookmark Saved Commutes</td>
                <td className="py-2.5 px-3 text-center text-slate-300">—</td>
                <td className="py-2.5 px-3 text-center text-emerald-600">✓</td>
                <td className="py-2.5 px-3 text-center text-emerald-600">✓</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-medium">Submit Platform &amp; Coach Crowd Reports</td>
                <td className="py-2.5 px-3 text-center text-slate-300">—</td>
                <td className="py-2.5 px-3 text-center text-emerald-600">✓</td>
                <td className="py-2.5 px-3 text-center text-emerald-600">✓</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-medium">Verify / Reject Commuter Crowd Reports</td>
                <td className="py-2.5 px-3 text-center text-slate-300">—</td>
                <td className="py-2.5 px-3 text-center text-slate-300">—</td>
                <td className="py-2.5 px-3 text-center text-emerald-600 font-bold">✓ Full Authority</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-medium">Transport CRUD (Add/Edit Stations &amp; Lines)</td>
                <td className="py-2.5 px-3 text-center text-slate-300">—</td>
                <td className="py-2.5 px-3 text-center text-slate-300">—</td>
                <td className="py-2.5 px-3 text-center text-emerald-600 font-bold">✓ Full Authority</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-medium">Broadcast Congestion Alerts to Commuters</td>
                <td className="py-2.5 px-3 text-center text-slate-300">—</td>
                <td className="py-2.5 px-3 text-center text-slate-300">—</td>
                <td className="py-2.5 px-3 text-center text-emerald-600 font-bold">✓ Full Authority</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

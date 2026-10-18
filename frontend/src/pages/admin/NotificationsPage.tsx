import React, { useState, useEffect } from 'react';
import {
  Bell,
  Plus,
  Trash2,
  AlertTriangle,
  Info,
  CheckCircle,
  Clock,
  Radio,
  X
} from 'lucide-react';
import { api } from '../../services/api';
import { TransitNotification, TransportMode } from '../../types';

export const NotificationsPage: React.FC = () => {
  const [notifications, setNotifications] = useState<TransitNotification[]>([]);
  const [loading, setLoading] = useState(true);

  // Create alert modal
  const [modalOpen, setModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [severity, setSeverity] = useState<'info' | 'warning' | 'alert'>('warning');
  const [mode, setMode] = useState<TransportMode>('train');
  const [affectedStations, setAffectedStations] = useState('Dadar, Andheri, Kurla');
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const fetchAlerts = async () => {
    try {
      setLoading(true);
      const res = await api.getNotifications(true); // all alerts
      setNotifications(res.notifications);
    } catch (err) {
      console.error('Error fetching alerts:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const stnList = affectedStations.split(',').map(s => s.trim()).filter(Boolean);
      const res = await api.createNotification({
        title,
        message,
        severity,
        mode,
        affectedStations: stnList
      });

      setNotifications([res.notification, ...notifications]);
      setModalOpen(false);
      setTitle('');
      setMessage('');
      setFeedback('Congestion advisory broadcasted across the transit network!');
      setTimeout(() => setFeedback(null), 4000);
    } catch (err: any) {
      alert('Failed to broadcast alert: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDismiss = async (id: string) => {
    try {
      await api.dismissNotification(id);
      setNotifications(notifications.map(n => (n.id === id ? { ...n, active: false } : n)));
      setFeedback('Alert dismissed.');
      setTimeout(() => setFeedback(null), 3000);
    } catch (err) {
      console.error('Failed to dismiss alert:', err);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-transit-navy tracking-tight flex items-center gap-2">
            <Bell size={24} className="text-transit-teal" />
            <span>Transit Congestion Advisories &amp; Alerts</span>
          </h1>
          <p className="text-xs text-transit-muted mt-1">
            Publish real-time delay bulletins, platform crowd warnings, and Sunday mega-block notices to passenger devices.
          </p>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="px-3.5 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded-transit flex items-center gap-1.5 shadow-xs transition-colors"
        >
          <Plus size={14} />
          <span>New Congestion Broadcast</span>
        </button>
      </div>

      {feedback && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-transit flex items-center gap-2">
          <CheckCircle size={15} className="text-emerald-600" />
          <span>{feedback}</span>
        </div>
      )}

      {/* Alerts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {notifications.map((notif) => {
          const badgeClass = {
            alert: 'bg-rose-50 text-rose-800 border-rose-200',
            warning: 'bg-amber-50 text-amber-800 border-amber-200',
            info: 'bg-sky-50 text-sky-800 border-sky-200'
          }[notif.severity];

          return (
            <div
              key={notif.id}
              className={`bg-white border rounded-card p-4 shadow-subtle flex flex-col justify-between gap-3 transition-opacity ${
                notif.active ? 'border-transit-border' : 'border-slate-200 opacity-60'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-[10px] uppercase font-mono font-semibold px-2 py-0.5 rounded border ${badgeClass}`}>
                    {notif.severity}
                  </span>
                  <div className="flex items-center gap-2 text-xs">
                    <span className="font-mono text-slate-400">
                      {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    <span className={`px-1.5 py-0.2 rounded text-[10px] font-mono ${
                      notif.active ? 'bg-emerald-50 text-emerald-700 font-semibold' : 'bg-slate-100 text-slate-500'
                    }`}>
                      {notif.active ? 'ACTIVE BROADCAST' : 'DISMISSED'}
                    </span>
                  </div>
                </div>

                <h3 className="font-bold text-base text-transit-navy">
                  {notif.title}
                </h3>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  {notif.message}
                </p>

                {notif.affectedStations && notif.affectedStations.length > 0 && (
                  <div className="mt-3 flex flex-wrap items-center gap-1 text-[11px] text-slate-500">
                    <span className="font-semibold text-slate-600">Affected:</span>
                    {notif.affectedStations.map((stn, i) => (
                      <span key={i} className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 font-medium">
                        {stn}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span>By {notif.authorName}</span>
                {notif.active && (
                  <button
                    onClick={() => handleDismiss(notif.id)}
                    className="text-rose-600 hover:text-rose-800 hover:underline font-medium"
                  >
                    Archive / Dismiss
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* New Broadcast Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-card border border-transit-border shadow-elevated w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="bg-transit-navy text-white px-5 py-3.5 flex items-center justify-between">
              <h3 className="font-semibold text-sm">
                Broadcast Network Congestion Notice
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleCreate} className="p-5 space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 uppercase mb-1">
                  Alert Severity Level *
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['info', 'warning', 'alert'] as const).map((sev) => (
                    <button
                      key={sev}
                      type="button"
                      onClick={() => setSeverity(sev)}
                      className={`py-1.5 rounded-transit border uppercase font-mono font-semibold transition-colors ${
                        severity === sev
                          ? sev === 'alert'
                            ? 'border-rose-600 bg-rose-50 text-rose-700'
                            : sev === 'warning'
                            ? 'border-amber-600 bg-amber-50 text-amber-700'
                            : 'border-sky-600 bg-sky-50 text-sky-700'
                          : 'border-slate-200 text-slate-600'
                      }`}
                    >
                      {sev}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 uppercase mb-1">
                  Advisory Title *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Mega Block on Harbour Line between Wadala & Vashi"
                  className="w-full px-2.5 py-1.5 border border-slate-200 rounded-transit focus:outline-none focus:ring-1 focus:ring-transit-teal text-xs"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 uppercase mb-1">
                  Notice Details / Passenger Advice *
                </label>
                <textarea
                  rows={3}
                  required
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Describe delay, alternative metro routes, or footbridge congestion..."
                  className="w-full px-2.5 py-1.5 border border-slate-200 rounded-transit focus:outline-none focus:ring-1 focus:ring-transit-teal text-xs resize-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 uppercase mb-1">
                  Primary Transport Mode
                </label>
                <select
                  value={mode}
                  onChange={(e) => setMode(e.target.value as TransportMode)}
                  className="w-full px-2.5 py-1.5 border border-slate-200 rounded-transit text-xs"
                >
                  <option value="train">Suburban Railway</option>
                  <option value="metro">Mumbai Metro</option>
                  <option value="bus">BEST Bus Service</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 uppercase mb-1">
                  Affected Stations (comma-separated)
                </label>
                <input
                  type="text"
                  value={affectedStations}
                  onChange={(e) => setAffectedStations(e.target.value)}
                  placeholder="Dadar, Kurla, Ghatkopar"
                  className="w-full px-2.5 py-1.5 border border-slate-200 rounded-transit text-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded font-semibold text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded font-semibold text-xs shadow-xs"
                >
                  {submitting ? 'Broadcasting...' : 'Publish Network Advisory'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

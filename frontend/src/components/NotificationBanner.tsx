import React, { useEffect, useState } from 'react';
import { AlertCircle, Info, Bell, X, ChevronRight } from 'lucide-react';
import { TransitNotification } from '../types';
import { api } from '../services/api';

export const NotificationBanner: React.FC = () => {
  const [notifications, setNotifications] = useState<TransitNotification[]>([]);
  const [dismissedIds, setDismissedIds] = useState<string[]>(() => {
    try {
      const saved = sessionStorage.getItem('goflow_dismissed_alerts');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        const res = await api.getNotifications(false);
        setNotifications(res.notifications || []);
      } catch (err) {
        console.warn('Could not load transit notifications:', err);
      }
    };
    fetchAlerts();
    const interval = setInterval(fetchAlerts, 60000);
    return () => clearInterval(interval);
  }, []);

  const handleDismiss = (id: string) => {
    const next = [...dismissedIds, id];
    setDismissedIds(next);
    try {
      sessionStorage.setItem('goflow_dismissed_alerts', JSON.stringify(next));
    } catch {
      // ignore
    }
  };

  const activeAlerts = notifications.filter((n) => !dismissedIds.includes(n.id));

  if (activeAlerts.length === 0) return null;

  const current = activeAlerts[currentIndex % activeAlerts.length];

  const severityStyles = {
    info: 'bg-sky-50/90 border-sky-100 text-sky-900',
    warning: 'bg-amber-50/90 border-amber-200/80 text-amber-900',
    alert: 'bg-rose-50/90 border-rose-200/80 text-rose-900'
  }[current.severity];

  const Icon = current.severity === 'alert' ? AlertCircle : current.severity === 'warning' ? Bell : Info;

  return (
    <aside
      aria-label="Transit alerts"
      className={`w-full border-b py-1.5 px-4 transition-all duration-200 text-xs ${severityStyles}`}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 overflow-hidden">
          <Icon size={14} className="shrink-0 text-current opacity-80" />
          <span className="font-semibold text-[10px] tracking-wider uppercase px-1.5 py-0.2 rounded bg-black/5 shrink-0">
            {current.severity}
          </span>
          <p className="truncate text-xs">
            <strong className="font-medium mr-1.5">{current.title}:</strong>
            <span className="opacity-85">{current.message}</span>
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {activeAlerts.length > 1 && (
            <button
              onClick={() => setCurrentIndex((prev) => (prev + 1) % activeAlerts.length)}
              className="text-[11px] hover:underline flex items-center gap-0.5 opacity-70 hover:opacity-100 transition-opacity"
              title="Next alert"
            >
              <span>{currentIndex + 1}/{activeAlerts.length}</span>
              <ChevronRight size={13} />
            </button>
          )}

          <button
            onClick={() => handleDismiss(current.id)}
            className="p-1 rounded hover:bg-black/5 opacity-60 hover:opacity-100 transition-opacity"
            title="Dismiss notification"
          >
            <X size={13} />
          </button>
        </div>
      </div>
    </aside>
  );
};

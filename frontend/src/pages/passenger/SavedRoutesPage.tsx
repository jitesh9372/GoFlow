import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bookmark, Trash2, ArrowRight, Clock, Plus, Train } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { RouteOption } from '../../types';

export const SavedRoutesPage: React.FC = () => {
  const { user, refreshProfile } = useAuth();
  const navigate = useNavigate();

  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (routeId: string) => {
    try {
      setDeletingId(routeId);
      await api.deleteSavedRoute(routeId);
      await refreshProfile();
    } catch (err) {
      console.error('Error removing saved route:', err);
    } finally {
      setDeletingId(null);
    }
  };

  const savedRoutes = user?.savedRoutes || [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Header */}
      <div className="bg-white border border-transit-border rounded-card p-5 shadow-subtle flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 rounded-transit bg-teal-50 text-transit-teal flex items-center justify-center">
              <Bookmark size={16} />
            </div>
            <h1 className="text-xl font-bold text-transit-navy tracking-tight">Saved Daily Commutes</h1>
          </div>
          <p className="text-xs text-transit-muted mt-0.5 ml-10">
            Quickly check live crowd status and route options for your regular Mumbai journeys.
          </p>
        </div>

        <button
          onClick={() => navigate('/routes')}
          className="px-3.5 py-2 bg-transit-teal hover:bg-transit-teal-hover text-white text-xs font-semibold rounded-transit flex items-center gap-1.5 shadow-xs transition-colors"
        >
          <Plus size={14} />
          <span>Plan New Route</span>
        </button>
      </div>

      {savedRoutes.length === 0 ? (
        <div className="bg-white border border-dashed border-slate-300 rounded-card p-12 text-center text-transit-muted max-w-lg mx-auto">
          <Bookmark size={36} className="mx-auto mb-3 text-slate-300" />
          <h3 className="font-bold text-base text-slate-700">No saved routes yet</h3>
          <p className="text-xs text-slate-500 mt-1 mb-4 leading-relaxed">
            Search any commute in the Route Planner and click &ldquo;Save Route&rdquo; to monitor its rush levels with one click.
          </p>
          <button
            onClick={() => navigate('/routes')}
            className="px-4 py-2 bg-transit-teal text-white text-xs font-semibold rounded-transit hover:bg-transit-teal-hover transition-colors"
          >
            Find My Commute
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {savedRoutes.map((saved) => (
            <div
              key={saved.id}
              className="bg-white border border-transit-border rounded-card p-4 shadow-subtle hover:shadow-card transition-all flex flex-col justify-between gap-4"
            >
              <div>
                <div className="flex items-center justify-between text-xs text-transit-muted mb-2">
                  <span className="font-mono uppercase text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
                    {saved.preferredMode || 'Suburban Rail'}
                  </span>
                  <span>
                    Saved {new Date(saved.savedAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                  </span>
                </div>

                <div className="flex items-center gap-2 font-bold text-transit-navy text-sm">
                  <span>{saved.fromStationName}</span>
                  <ArrowRight size={14} className="text-slate-400 shrink-0" />
                  <span>{saved.toStationName}</span>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <button
                  onClick={() => navigate(`/routes?from=${saved.fromStationId}&to=${saved.toStationId}`)}
                  className="font-semibold text-transit-teal hover:underline flex items-center gap-1"
                >
                  <span>Check Live Crowd</span>
                  <ArrowRight size={12} />
                </button>

                <button
                  onClick={() => handleDelete(saved.id)}
                  disabled={deletingId === saved.id}
                  className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
                  title="Remove saved route"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

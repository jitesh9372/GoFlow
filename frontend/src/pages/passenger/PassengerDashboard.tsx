import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Train,
  Compass,
  Bus,
  MapPin,
  Clock,
  Send,
  Bookmark,
  ArrowRight,
  ShieldCheck,
  TrendingUp,
  AlertTriangle,
  Radio,
  LogOut
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { Station, CrowdReading, TransitLine } from '../../types';
import { CrowdBadge } from '../../components/CrowdBadge';

export const PassengerDashboard: React.FC = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const [stations, setStations] = useState<Station[]>([]);
  const [readings, setReadings] = useState<CrowdReading[]>([]);
  const [lines, setLines] = useState<TransitLine[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [stnRes, readRes, lineRes] = await Promise.all([
          api.getStations(),
          api.getCrowdReadings(),
          api.getLines()
        ]);
        setStations(stnRes.stations);
        setReadings(readRes.readings);
        setLines(lineRes.lines);
      } catch (err) {
        console.error('Error loading passenger dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const busiestReadings = readings
    .filter(r => r.crowdLevel === 'high')
    .slice(0, 5);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Welcome Banner */}
      <div className="bg-white border border-transit-border rounded-card p-6 shadow-subtle flex flex-wrap items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold text-transit-teal uppercase tracking-wider block">
            Mumbai Suburban &amp; Metro Transit Network
          </span>
          <h1 className="text-2xl font-bold text-transit-navy tracking-tight mt-0.5">
            Welcome, {user?.displayName || 'Mumbai Commuter'}
          </h1>
          <p className="text-xs text-transit-muted mt-1 max-w-xl">
            Real-time crowd intelligence across 48+ stations, 8 lines, and BEST feeder networks. Check congestion before you board.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate('/routes')}
            className="px-4 py-2 bg-transit-teal hover:bg-transit-teal-hover text-white text-xs font-semibold rounded-transit flex items-center gap-1.5 shadow-xs transition-colors"
          >
            <Train size={14} />
            <span>Plan Commute</span>
          </button>
          <button
            onClick={() => navigate('/railradar')}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-transit flex items-center gap-1.5 shadow-xs transition-colors"
          >
            <Radio size={14} className="text-emerald-400 animate-pulse" />
            <span>Live Radar</span>
          </button>
          <button
            onClick={() => navigate('/report')}
            className="px-4 py-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold rounded-transit flex items-center gap-1.5 shadow-2xs transition-colors"
          >
            <Send size={14} />
            <span>Report Rush</span>
          </button>
          <button
            onClick={async () => {
              await signOut();
              navigate('/signin');
            }}
            className="px-4 py-2 bg-white hover:bg-rose-50 border border-slate-200 hover:border-rose-200 text-slate-700 hover:text-rose-600 text-xs font-semibold rounded-transit flex items-center gap-1.5 shadow-2xs transition-colors"
          >
            <LogOut size={14} />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* RailRadar Live Telemetry Bar */}
      <div className="bg-gradient-to-r from-transit-navy via-slate-900 to-teal-950 text-white rounded-card p-4 shadow-subtle border border-teal-500/20 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-teal-500/20 border border-teal-500/30 flex items-center justify-center text-teal-300">
            <Radio size={20} className="animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm text-white">Live RailRadar Train Telemetry Active</span>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                Live GPS
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-0.5">
              Live tracking for Mumbai locals, Vande Bharat, and Intercity Express. View real-time delays, platform numbers, and coach rakes.
            </p>
          </div>
        </div>

        <Link
          to="/railradar"
          className="px-4 py-2 rounded-xl bg-transit-teal hover:bg-transit-teal-hover text-white text-xs font-bold flex items-center gap-2 shadow-2xs transition-all shrink-0"
        >
          <span>Open Live Train Radar</span>
          <ArrowRight size={14} />
        </Link>
      </div>

      {/* Transit Choices Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Local Trains */}
        <div
          onClick={() => navigate('/routes?mode=train')}
          className="bg-white border border-teal-200/80 hover:border-teal-400 rounded-card p-5 shadow-subtle hover:shadow-card cursor-pointer transition-all flex flex-col justify-between gap-4 group"
        >
          <div>
            <div className="w-10 h-10 rounded-transit bg-teal-50 text-teal-800 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
              <Train size={22} />
            </div>
            <h3 className="font-bold text-base text-transit-navy">Mumbai Local Trains</h3>
            <p className="text-xs text-slate-500 mt-1">
              Western (WR), Central (CR), and Harbour (HR) suburban rail services.
            </p>
          </div>
          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-transit-teal font-semibold">
            <span>Explore Train Routes</span>
            <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        {/* Mumbai Metro */}
        <div
          onClick={() => navigate('/routes?mode=metro')}
          className="bg-white border border-sky-200/80 hover:border-sky-400 rounded-card p-5 shadow-subtle hover:shadow-card cursor-pointer transition-all flex flex-col justify-between gap-4 group"
        >
          <div>
            <div className="w-10 h-10 rounded-transit bg-sky-50 text-sky-800 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
              <Compass size={22} />
            </div>
            <h3 className="font-bold text-base text-transit-navy">Mumbai Metro</h3>
            <p className="text-xs text-slate-500 mt-1">
              Line 1 (Blue), Line 2A (Yellow), Line 7 (Red), and Line 3 (Aqua Line BKC).
            </p>
          </div>
          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-sky-700 font-semibold">
            <span>Explore Metro Lines</span>
            <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        {/* BEST Buses */}
        <div
          onClick={() => navigate('/routes?mode=bus')}
          className="bg-white border border-amber-200/80 hover:border-amber-400 rounded-card p-5 shadow-subtle hover:shadow-card cursor-pointer transition-all flex flex-col justify-between gap-4 group"
        >
          <div>
            <div className="w-10 h-10 rounded-transit bg-amber-50 text-amber-800 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
              <Bus size={22} />
            </div>
            <h3 className="font-bold text-base text-transit-navy">BEST Feeder Buses</h3>
            <p className="text-xs text-slate-500 mt-1">
              Direct station links to BKC, SEEPZ, Powai, and South Mumbai offices.
            </p>
          </div>
          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-amber-700 font-semibold">
            <span>Explore Feeder Buses</span>
            <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
          </div>
        </div>
      </div>

      {/* Two Column: Live High-Rush Alert Table vs Shortcuts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Heavy Rush Stations */}
        <div className="lg:col-span-7 bg-white border border-transit-border rounded-card p-5 shadow-subtle space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="font-bold text-base text-transit-navy flex items-center gap-1.5">
                <Radio size={16} className="text-rose-600 animate-pulse" />
                <span>Current High-Density Stations (SDCL)</span>
              </h3>
              <p className="text-xs text-transit-muted">
                Stations currently exceeding 80% occupancy threshold.
              </p>
            </div>
            <Link to="/map" className="text-xs text-transit-teal font-semibold hover:underline">
              View Map
            </Link>
          </div>

          <div className="space-y-2.5">
            {busiestReadings.length === 0 ? (
              <p className="text-xs text-slate-500 py-4 text-center">
                All suburban lines currently operating at normal density.
              </p>
            ) : (
              busiestReadings.map((reading) => (
                <div
                  key={reading.id}
                  className="flex items-center justify-between p-3 rounded-transit border border-rose-100 bg-rose-50/40 text-xs"
                >
                  <div>
                    <h5 className="font-bold text-slate-900 text-sm">
                      {reading.stationName}
                    </h5>
                    <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5">
                      <span className="capitalize">{reading.mode}</span>
                      <span>•</span>
                      <span>Source: {reading.source.replace('_', ' ')}</span>
                      <span>•</span>
                      <span className="font-mono">
                        {new Date(reading.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <CrowdBadge level={reading.crowdLevel} occupancy={reading.occupancyPercentage} size="sm" />
                    <button
                      onClick={() => navigate(`/routes?from=${reading.stationId}`)}
                      className="px-2 py-1 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 rounded text-[11px] font-medium"
                    >
                      Avoid Route
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right: Commuter Tools & Saved Commutes */}
        <div className="lg:col-span-5 space-y-4">
          {/* Saved Routes Box */}
          <div className="bg-white border border-transit-border rounded-card p-5 shadow-subtle space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h4 className="font-bold text-sm text-transit-navy flex items-center gap-1.5">
                <Bookmark size={15} className="text-transit-teal" />
                <span>My Saved Commutes</span>
              </h4>
              <Link to="/saved" className="text-xs text-transit-teal font-semibold hover:underline">
                View All
              </Link>
            </div>

            {user?.savedRoutes && user.savedRoutes.length > 0 ? (
              <div className="space-y-2">
                {user.savedRoutes.slice(0, 3).map((sr) => (
                  <div
                    key={sr.id}
                    onClick={() => navigate(`/routes?from=${sr.fromStationId}&to=${sr.toStationId}`)}
                    className="p-2.5 rounded-transit border border-slate-200 hover:border-teal-300 hover:bg-teal-50/30 cursor-pointer transition-colors flex items-center justify-between text-xs"
                  >
                    <div className="font-medium text-slate-800">
                      {sr.fromStationName} → {sr.toStationName}
                    </div>
                    <ArrowRight size={13} className="text-slate-400" />
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400 py-3 text-center">
                No saved routes yet. Use the Route Planner to bookmark your daily journey.
              </p>
            )}
          </div>

          {/* Quick Shortcuts */}
          <div className="bg-white border border-transit-border rounded-card p-5 shadow-subtle space-y-3">
            <h4 className="font-bold text-sm text-transit-navy">Quick Shortcuts</h4>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <Link
                to="/map"
                className="p-3 rounded-transit border border-slate-200 hover:bg-slate-50 transition-colors flex flex-col gap-1 text-slate-700"
              >
                <MapPin size={16} className="text-transit-teal" />
                <span className="font-semibold text-slate-900">Live Crowd Map</span>
                <span className="text-[11px] text-slate-400">Station occupancy pins</span>
              </Link>

              <Link
                to="/timings"
                className="p-3 rounded-transit border border-slate-200 hover:bg-slate-50 transition-colors flex flex-col gap-1 text-slate-700"
              >
                <Clock size={16} className="text-transit-teal" />
                <span className="font-semibold text-slate-900">Peak Timings</span>
                <span className="text-[11px] text-slate-400">Quiet window charts</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

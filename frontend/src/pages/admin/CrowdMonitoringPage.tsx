import React, { useState, useEffect } from 'react';
import {
  Radio,
  Plus,
  Filter,
  RefreshCw,
  Search,
  CheckCircle,
  AlertTriangle,
  Clock,
  ShieldCheck,
  TrendingUp,
  Activity
} from 'lucide-react';
import { api } from '../../services/api';
import { Station, CrowdReading, TransportMode, CrowdLevel, CrowdSource } from '../../types';
import { CrowdBadge, getCrowdLevelInfo } from '../../components/CrowdBadge';
import { ModeIcon } from '../../components/ModeIcon';

export const CrowdMonitoringPage: React.FC = () => {
  const [readings, setReadings] = useState<CrowdReading[]>([]);
  const [stations, setStations] = useState<Station[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [selectedLevel, setSelectedLevel] = useState<string>('all');
  const [selectedMode, setSelectedMode] = useState<string>('all');

  // Override Modal
  const [overrideModalOpen, setOverrideModalOpen] = useState(false);
  const [selectedStationId, setSelectedStationId] = useState('');
  const [overrideCrowd, setOverrideCrowd] = useState<CrowdLevel>('high');
  const [overrideOccupancy, setOverrideOccupancy] = useState<number>(85);
  const [overrideSource, setOverrideSource] = useState<CrowdSource>('live_sensor');
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const fetchReadings = async () => {
    try {
      setLoading(true);
      const [readRes, stnRes] = await Promise.all([
        api.getCrowdReadings(),
        api.getStations()
      ]);
      setReadings(readRes.readings);
      setStations(stnRes.stations);
      if (stnRes.stations.length > 0 && !selectedStationId) {
        setSelectedStationId(stnRes.stations[0].id);
      }
    } catch (err) {
      console.error('Error fetching crowd readings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReadings();
  }, []);

  const handleOverrideSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const stn = stations.find(s => s.id === selectedStationId);
    if (!stn) return;

    setSubmitting(true);
    try {
      const res = await api.postCrowdReading({
        stationId: stn.id,
        stationName: stn.name,
        mode: stn.mode,
        crowdLevel: overrideCrowd,
        occupancyPercentage: overrideOccupancy,
        source: overrideSource,
        verified: true,
        direction: 'BOTH',
        coachType: 'all'
      });

      setReadings([res.reading, ...readings.filter(r => r.stationId !== stn.id)]);
      setOverrideModalOpen(false);
      setFeedback(`Live sensor crowd reading updated for ${stn.name}!`);
      setTimeout(() => setFeedback(null), 4000);
    } catch (err: any) {
      alert('Failed to submit reading: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const filtered = readings.filter(r => {
    const matchesSearch = !search || r.stationName.toLowerCase().includes(search.toLowerCase());
    const matchesLevel = selectedLevel === 'all' || r.crowdLevel === selectedLevel;
    const matchesMode = selectedMode === 'all' || r.mode === selectedMode;
    return matchesSearch && matchesLevel && matchesMode;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-transit-navy tracking-tight flex items-center gap-2">
            <Radio size={24} className="text-transit-teal animate-pulse" />
            <span>Live Transit Crowd Monitoring</span>
          </h1>
          <p className="text-xs text-transit-muted mt-1">
            Real-time telemetry, automated platform sensors, and manual density calibrations.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setOverrideModalOpen(true)}
            className="px-3.5 py-2 bg-transit-teal hover:bg-transit-teal-hover text-white text-xs font-semibold rounded-transit flex items-center gap-1.5 shadow-xs transition-colors"
          >
            <Plus size={14} />
            <span>Record Sensor Reading</span>
          </button>
          <button
            onClick={fetchReadings}
            className="p-2 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 rounded-transit shadow-2xs"
            title="Refresh Readings"
          >
            <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {feedback && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-transit flex items-center gap-2">
          <CheckCircle size={15} className="text-emerald-600" />
          <span>{feedback}</span>
        </div>
      )}

      {/* Filter Bar */}
      <div className="bg-white border border-transit-border rounded-card p-3 shadow-subtle flex flex-wrap items-center justify-between gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={15} className="absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search monitored station..."
            className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-200 rounded-transit focus:outline-none focus:ring-1 focus:ring-transit-teal"
          />
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-400 font-semibold uppercase text-[10px]">Level:</span>
          <select
            value={selectedLevel}
            onChange={(e) => setSelectedLevel(e.target.value)}
            className="px-2 py-1 border border-slate-200 rounded-transit bg-white text-slate-700"
          >
            <option value="all">All Levels</option>
            <option value="high">High Density (SDCL)</option>
            <option value="medium">Moderate Rush</option>
            <option value="low">Comfortable</option>
          </select>

          <span className="text-slate-400 font-semibold uppercase text-[10px] ml-2">Mode:</span>
          <select
            value={selectedMode}
            onChange={(e) => setSelectedMode(e.target.value)}
            className="px-2 py-1 border border-slate-200 rounded-transit bg-white text-slate-700"
          >
            <option value="all">All Modes</option>
            <option value="train">Local Trains</option>
            <option value="metro">Metro</option>
            <option value="bus">BEST Bus</option>
          </select>
        </div>
      </div>

      {/* Readings Table */}
      <div className="bg-white border border-transit-border rounded-card shadow-card overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider">
            <tr>
              <th className="py-2.5 px-3">Station / Terminal</th>
              <th className="py-2.5 px-3">Transport Mode</th>
              <th className="py-2.5 px-3">Crowd Rating</th>
              <th className="py-2.5 px-3">Platform Occupancy</th>
              <th className="py-2.5 px-3">Telemetry Source</th>
              <th className="py-2.5 px-3">Direction</th>
              <th className="py-2.5 px-3 text-right">Last Verified</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.map((reading) => {
              const info = getCrowdLevelInfo(reading.crowdLevel);
              return (
                <tr key={reading.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3 px-3 font-semibold text-transit-navy">
                    {reading.stationName}
                  </td>
                  <td className="py-3 px-3">
                    <span className="inline-flex items-center gap-1 capitalize px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[11px]">
                      <ModeIcon mode={reading.mode} size={12} />
                      {reading.mode}
                    </span>
                  </td>
                  <td className="py-3 px-3">
                    <CrowdBadge level={reading.crowdLevel} size="sm" />
                  </td>
                  <td className="py-3 px-3">
                    <div className="flex items-center gap-2 max-w-[120px]">
                      <div className="flex-1 bg-slate-100 rounded-full h-1.5 overflow-hidden">
                        <div
                          className={`h-full rounded-full ${info.dotColor}`}
                          style={{ width: `${reading.occupancyPercentage}%` }}
                        />
                      </div>
                      <span className="font-mono font-semibold text-[11px]">
                        {reading.occupancyPercentage}%
                      </span>
                    </div>
                  </td>
                  <td className="py-3 px-3">
                    <span className="font-mono capitalize text-slate-600 text-[11px]">
                      {reading.source.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-slate-600 font-mono text-[11px]">
                    {reading.direction || 'BOTH'}
                  </td>
                  <td className="py-3 px-3 text-right text-slate-400 font-mono text-[11px]">
                    {new Date(reading.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Record Sensor Reading Modal */}
      {overrideModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-card border border-transit-border shadow-elevated w-full max-w-md overflow-hidden">
            <div className="bg-transit-navy text-white px-5 py-3.5 flex items-center justify-between">
              <h3 className="font-semibold text-sm">
                Record Station Crowd Reading
              </h3>
              <button
                onClick={() => setOverrideModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleOverrideSubmit} className="p-5 space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 uppercase mb-1">
                  Select Station *
                </label>
                <select
                  value={selectedStationId}
                  onChange={(e) => setSelectedStationId(e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-slate-200 rounded-transit focus:outline-none focus:ring-1 focus:ring-transit-teal text-xs"
                >
                  {stations.map(stn => (
                    <option key={stn.id} value={stn.id}>
                      {stn.name} ({stn.mode.toUpperCase()})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 uppercase mb-1">
                  Crowd Level Category *
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['low', 'medium', 'high'] as CrowdLevel[]).map((lvl) => (
                    <button
                      key={lvl}
                      type="button"
                      onClick={() => {
                        setOverrideCrowd(lvl);
                        setOverrideOccupancy(lvl === 'high' ? 88 : lvl === 'medium' ? 60 : 30);
                      }}
                      className={`py-1.5 rounded-transit border capitalize font-semibold transition-colors ${
                        overrideCrowd === lvl
                          ? 'border-transit-teal bg-teal-50 text-transit-teal'
                          : 'border-slate-200 text-slate-600'
                      }`}
                    >
                      {lvl === 'high' ? 'SDCL Rush' : lvl}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-semibold text-slate-700 uppercase">
                    Occupancy Percentage ({overrideOccupancy}%)
                  </label>
                </div>
                <input
                  type="range"
                  min="5"
                  max="100"
                  value={overrideOccupancy}
                  onChange={(e) => setOverrideOccupancy(parseInt(e.target.value, 10))}
                  className="w-full accent-transit-teal"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 uppercase mb-1">
                  Data Telemetry Source
                </label>
                <select
                  value={overrideSource}
                  onChange={(e) => setOverrideSource(e.target.value as CrowdSource)}
                  className="w-full px-2.5 py-1.5 border border-slate-200 rounded-transit text-xs"
                >
                  <option value="live_sensor">Live IoT Sensor / Turnstile Ingest</option>
                  <option value="verified_survey">Verified Ground Survey</option>
                  <option value="passenger_report">Verified Passenger Report</option>
                  <option value="historical_pattern">Historical Model Projection</option>
                  <option value="predicted">AI Predicted Model</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setOverrideModalOpen(false)}
                  className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-1.5 bg-transit-teal hover:bg-transit-teal-hover text-white rounded text-xs font-semibold"
                >
                  {submitting ? 'Applying...' : 'Apply Telemetry Reading'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

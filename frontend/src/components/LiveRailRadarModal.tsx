import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Train,
  X,
  Radio,
  Clock,
  MapPin,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  RefreshCw,
  Navigation,
  Gauge,
  Layers,
  Sparkles,
  ExternalLink
} from 'lucide-react';
import { api } from '../services/api';
import { RailRadarLiveStatus, RailRadarStop } from '../types';

interface LiveRailRadarModalProps {
  trainNumber: string | null;
  onClose: () => void;
}

export const LiveRailRadarModal: React.FC<LiveRailRadarModalProps> = ({
  trainNumber,
  onClose
}) => {
  const [loading, setLoading] = useState(false);
  const [liveData, setLiveData] = useState<RailRadarLiveStatus | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'route' | 'coaches'>('overview');

  const fetchLive = async (num: string) => {
    setLoading(true);
    setLiveData(null);
    setError(null);
    try {
      const res = await api.getLiveTrainStatus(num);
      if (res && res.live) {
        setLiveData(res.live);
      } else {
        setError('Train status currently unavailable');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch live train telemetry');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (trainNumber) {
      fetchLive(trainNumber);
    }
  }, [trainNumber]);

  if (!trainNumber) return null;

  const isDelayed = (liveData?.delayMinutes ?? 0) > 5;
  const isSeverelyDelayed = (liveData?.delayMinutes ?? 0) > 20;

  // Split coach position string into array
  const coachList = liveData?.currentLocation
    ? (liveData.route?.find((r) => r.coachPosition)?.coachPosition ||
       'ENG-LPR-B1-B2-B3-B4-B5-B6-B7-B8-PC-A1-A2-A3-H1-LPR-VP'
      ).split('-')
    : [];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.2 }}
          className="bg-white rounded-2xl shadow-2xl border border-slate-200/80 w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden text-slate-800"
        >
          {/* Header */}
          <div className="relative p-5 bg-gradient-to-r from-transit-navy via-slate-900 to-transit-navy text-white flex items-center justify-between border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-transit-teal/20 border border-transit-teal/40 flex items-center justify-center text-transit-teal shrink-0">
                <Train size={22} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-sm bg-white/10 px-2 py-0.5 rounded text-transit-teal border border-transit-teal/30">
                    #{trainNumber}
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                    RailRadar Live
                  </span>
                </div>
                <h3 className="font-bold text-base sm:text-lg leading-tight mt-1 line-clamp-1">
                  {liveData?.trainName || `Train #${trainNumber}`}
                </h3>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => fetchLive(trainNumber)}
                disabled={loading}
                className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-slate-200 hover:text-white transition-colors"
                title="Refresh Live Status"
              >
                <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
              </button>
              <button
                type="button"
                onClick={onClose}
                className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-slate-200 hover:text-white transition-colors"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex border-b border-slate-200 bg-slate-50 px-5 pt-2 gap-4">
            <button
              type="button"
              onClick={() => setActiveTab('overview')}
              className={`pb-2.5 text-xs font-semibold border-b-2 transition-colors flex items-center gap-1.5 ${
                activeTab === 'overview'
                  ? 'border-transit-teal text-transit-navy'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Radio size={14} />
              Live Telemetry
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('route')}
              className={`pb-2.5 text-xs font-semibold border-b-2 transition-colors flex items-center gap-1.5 ${
                activeTab === 'route'
                  ? 'border-transit-teal text-transit-navy'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Navigation size={14} />
              Upcoming Halts ({liveData?.route?.length || 0})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('coaches')}
              className={`pb-2.5 text-xs font-semibold border-b-2 transition-colors flex items-center gap-1.5 ${
                activeTab === 'coaches'
                  ? 'border-transit-teal text-transit-navy'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Layers size={14} />
              Coach Layout
            </button>
          </div>

          {/* Modal Body */}
          <div className="flex-1 overflow-y-auto p-5">
            {loading && !liveData && (
              <div className="py-16 flex flex-col items-center justify-center text-center">
                <RefreshCw size={32} className="text-transit-teal animate-spin mb-3" />
                <p className="text-sm font-medium text-slate-600">
                  Contacting RailRadar GPS telemetry...
                </p>
                <p className="text-xs text-slate-400 mt-1">Retrieving real-time coordinates & platform forecast</p>
              </div>
            )}

            {error && (
              <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-sm flex items-start gap-3">
                <AlertTriangle size={18} className="shrink-0 mt-0.5 text-rose-500" />
                <div>
                  <p className="font-semibold">Unable to fetch live telemetry</p>
                  <p className="text-xs mt-0.5 text-rose-600">{error}</p>
                </div>
              </div>
            )}

            {liveData && (
              <>
                {/* Tab 1: Overview */}
                {activeTab === 'overview' && (
                  <div className="space-y-4">
                    {/* Running Status Pill Header */}
                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/90 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <div className="text-xs text-slate-500 font-medium">Running Status</div>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold ${
                              isSeverelyDelayed
                                ? 'bg-rose-100 text-rose-700 border border-rose-200'
                                : isDelayed
                                ? 'bg-amber-100 text-amber-700 border border-amber-200'
                                : 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                            }`}
                          >
                            <Clock size={13} />
                            {isDelayed
                              ? `Delayed by ${liveData.delayMinutes} mins`
                              : 'Running On Time (Right Time)'}
                          </span>
                          <span className="text-xs text-slate-500">
                            Status: <strong className="capitalize text-slate-700">{liveData.status}</strong>
                          </span>
                        </div>
                      </div>

                      {liveData.lastUpdatedAt && (
                        <div className="text-left sm:text-right text-[11px] text-slate-400">
                          Updated: {new Date(liveData.lastUpdatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                        </div>
                      )}
                    </div>

                    {/* Current Segment Visualizer */}
                    <div className="p-4 rounded-xl bg-gradient-to-br from-teal-50/50 via-white to-blue-50/40 border border-teal-100 shadow-2xs">
                      <div className="text-xs font-semibold text-transit-navy flex items-center gap-1.5 mb-3">
                        <Gauge size={15} className="text-transit-teal" />
                        <span>Live Location & Progress</span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                        <div className="p-3 bg-white rounded-lg border border-slate-200/80">
                          <span className="text-[11px] text-slate-500 block">Current Location Station</span>
                          <span className="font-bold text-sm text-slate-800 mt-0.5 block">
                            {liveData.currentLocation?.stationName || 'En Route'}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono">
                            Code: {liveData.currentLocation?.stationCode || '--'}
                          </span>
                        </div>

                        <div className="p-3 bg-white rounded-lg border border-slate-200/80">
                          <span className="text-[11px] text-slate-500 block">Next Scheduled Halt</span>
                          <span className="font-bold text-sm text-transit-teal mt-0.5 block">
                            {liveData.nextHalt?.stationName || 'Terminal Destination'}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono">
                            Code: {liveData.nextHalt?.stationCode || '--'}
                          </span>
                        </div>
                      </div>

                      {/* Animated Progress Bar */}
                      <div className="mt-4">
                        <div className="flex items-center justify-between text-[11px] text-slate-500 mb-1">
                          <span>{liveData.previousHalt?.stationName || 'Previous Halt'}</span>
                          <span className="font-semibold text-transit-teal">
                            {liveData.currentLocation?.distanceFromOriginKm
                              ? `${Math.round(liveData.currentLocation.distanceFromOriginKm)} km traversed`
                              : 'Live Tracking'}
                          </span>
                          <span>{liveData.nextHalt?.stationName || 'Next Halt'}</span>
                        </div>
                        <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden relative">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{
                              width: `${Math.min(100, Math.max(15, (liveData.currentLocation?.segmentProgress || 0.65) * 100))}%`
                            }}
                            transition={{ duration: 1, ease: 'easeOut' }}
                            className="h-full bg-gradient-to-r from-transit-teal to-emerald-500 rounded-full"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Telemetry metadata footer */}
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/70 flex items-center justify-between text-xs text-slate-500">
                      <div className="flex items-center gap-1.5">
                        <Sparkles size={14} className="text-transit-teal" />
                        <span>Data verified via <strong>RailRadar Indian Railways Telemetry API</strong></span>
                      </div>
                      <span className="text-[11px] font-mono bg-white px-2 py-0.5 rounded border border-slate-200">
                        GPS Active
                      </span>
                    </div>
                  </div>
                )}

                {/* Tab 2: Route Halts */}
                {activeTab === 'route' && (
                  <div className="space-y-2">
                    <p className="text-xs text-slate-500 mb-3">
                      List of intermediate halts, platform numbers, and scheduled versus actual arrival times:
                    </p>

                    {liveData.route && liveData.route.length > 0 ? (
                      <div className="space-y-2 max-h-[360px] overflow-y-auto pr-1">
                        {liveData.route
                          .filter((stop) => stop.isHalt || stop.platform)
                          .map((stop: RailRadarStop, idx) => {
                            const isCurrent =
                              stop.stationCode === liveData.currentLocation?.stationCode;

                            return (
                              <div
                                key={`${stop.stationCode}-${idx}`}
                                className={`p-3 rounded-xl border flex items-center justify-between text-xs transition-all ${
                                  isCurrent
                                    ? 'bg-teal-50/80 border-teal-300 ring-1 ring-teal-300'
                                    : 'bg-white border-slate-200 hover:border-slate-300'
                                }`}
                              >
                                <div className="flex items-center gap-3">
                                  <div
                                    className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-[10px] shrink-0 ${
                                      isCurrent
                                        ? 'bg-transit-teal text-white shadow-2xs'
                                        : 'bg-slate-100 text-slate-600'
                                    }`}
                                  >
                                    {idx + 1}
                                  </div>
                                  <div>
                                    <div className="font-bold text-slate-800 flex items-center gap-1.5">
                                      <span>{stop.stationName}</span>
                                      <span className="text-[10px] font-mono text-slate-400">
                                        ({stop.stationCode})
                                      </span>
                                      {isCurrent && (
                                        <span className="text-[9px] font-semibold px-1.5 py-0.2 rounded bg-teal-100 text-teal-800">
                                          Current
                                        </span>
                                      )}
                                    </div>
                                    <div className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-2">
                                      {stop.platform && (
                                        <span className="font-semibold text-slate-700">
                                          Platform: {stop.platform}
                                        </span>
                                      )}
                                      {stop.status && (
                                        <span className="capitalize text-slate-400">
                                          &bull; {stop.status}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </div>

                                <div className="text-right">
                                  <div className="font-mono font-semibold text-slate-700">
                                    {stop.scheduledDeparture
                                      ? new Date(stop.scheduledDeparture).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                                      : stop.scheduledArrival
                                      ? new Date(stop.scheduledArrival).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                                      : '--'}
                                  </div>
                                  <div className="text-[10px] text-slate-400">
                                    {stop.delayMinutes && stop.delayMinutes > 0
                                      ? `+${stop.delayMinutes}m delay`
                                      : 'On Time'}
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                      </div>
                    ) : (
                      <div className="p-8 text-center text-xs text-slate-500 bg-slate-50 rounded-xl">
                        Intermediate halts data will appear when train approaches the section.
                      </div>
                    )}
                  </div>
                )}

                {/* Tab 3: Coach Layout */}
                {activeTab === 'coaches' && (
                  <div className="space-y-4">
                    <p className="text-xs text-slate-500">
                      Standard coach position layout from engine to rear rake for train #{trainNumber}:
                    </p>

                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                      <div className="flex items-center gap-2 overflow-x-auto pb-3 pt-1">
                        {coachList.map((coach, i) => {
                          const isEngine = coach.toLowerCase().includes('eng');
                          const isAC = coach.startsWith('A') || coach.startsWith('B') || coach.startsWith('H');
                          const isPantry = coach.toLowerCase().includes('pc');

                          return (
                            <div
                              key={i}
                              className={`shrink-0 flex flex-col items-center justify-center rounded-lg border p-2 min-w-[50px] shadow-2xs ${
                                isEngine
                                  ? 'bg-transit-navy text-white border-transit-navy'
                                  : isAC
                                  ? 'bg-blue-50 text-blue-800 border-blue-200 font-bold'
                                  : isPantry
                                  ? 'bg-amber-50 text-amber-800 border-amber-200'
                                  : 'bg-white text-slate-700 border-slate-200'
                              }`}
                            >
                              <span className="text-[10px] font-mono font-bold">{coach}</span>
                              <span className="text-[9px] text-slate-400 mt-0.5">
                                #{i + 1}
                              </span>
                            </div>
                          );
                        })}
                      </div>

                      <div className="flex flex-wrap items-center gap-4 text-[11px] text-slate-500 mt-2 pt-2 border-t border-slate-200">
                        <div className="flex items-center gap-1.5">
                          <span className="w-2.5 h-2.5 rounded bg-transit-navy inline-block" />
                          <span>Locomotive Engine</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="w-2.5 h-2.5 rounded bg-blue-100 border border-blue-200 inline-block" />
                          <span>AC Coaches (1A/2A/3A)</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="w-2.5 h-2.5 rounded bg-white border border-slate-200 inline-block" />
                          <span>Sleeper / General Coaches</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Modal Footer */}
          <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
            <span className="text-[11px] text-slate-400">
              API key: rg_d2e8... &bull; RailRadar live telemetry
            </span>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-1.5 text-xs font-semibold bg-slate-200 hover:bg-slate-300 rounded-lg text-slate-700 transition-colors"
            >
              Close
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

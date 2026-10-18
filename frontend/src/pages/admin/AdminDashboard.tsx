import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Train,
  Radio,
  BarChart3,
  CheckSquare,
  Bell,
  Users,
  AlertTriangle,
  ArrowRight,
  Shield,
  Activity,
  Plus,
  CheckCircle2,
  XCircle,
  Clock,
  Sparkles,
  RefreshCw,
  Send,
  MessageSquare,
  Filter,
  Layers,
  ChevronRight,
  Check,
  X
} from 'lucide-react';
import { api } from '../../services/api';
import { firestoreSync } from '../../services/firestoreService';
import { useAuth } from '../../context/AuthContext';
import {
  Station,
  TransitLine,
  CrowdReading,
  CrowdReport,
  TransitNotification,
  ActivityItem
} from '../../types';
import { CrowdBadge } from '../../components/CrowdBadge';
import { CountUp } from '../../components/CountUp';

export const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [stations, setStations] = useState<Station[]>([]);
  const [lines, setLines] = useState<TransitLine[]>([]);
  const [readings, setReadings] = useState<CrowdReading[]>([]);
  const [reports, setReports] = useState<CrowdReport[]>([]);
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [notifications, setNotifications] = useState<TransitNotification[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter tabs for rush reports
  const [reportFilter, setReportFilter] = useState<'all' | 'pending' | 'verified' | 'rejected'>('pending');

  // Processing state for inline review
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  // Real-time Firestore sync status
  const [isLiveFirestore, setIsLiveFirestore] = useState(true);

  useEffect(() => {
    let unsubReports: (() => void) | undefined;
    let unsubActivities: (() => void) | undefined;
    let unsubReadings: (() => void) | undefined;

    const fetchData = async () => {
      try {
        setLoading(true);
        const [stnRes, lineRes, readRes, repRes, notifRes] = await Promise.all([
          api.getStations(),
          api.getLines(),
          api.getCrowdReadings(),
          api.getReports(), // Get all reports so admin has complete picture
          api.getNotifications(false)
        ]);

        setStations(stnRes.stations);
        setLines(lineRes.lines);
        setReadings(readRes.readings);
        setReports(repRes.reports);
        setNotifications(notifRes.notifications);

        // Seed initial data to Firestore if not present
        await firestoreSync.seedInitialDataIfEmpty(repRes.reports, readRes.readings);

        // Real-time Firestore Listener for Crowd Reports
        unsubReports = firestoreSync.subscribeToCrowdReports((liveReports) => {
          if (liveReports && liveReports.length > 0) {
            setReports(liveReports);
            setIsLiveFirestore(true);
          }
        });

        // Real-time Firestore Listener for Activities Stream
        unsubActivities = firestoreSync.subscribeToActivities((liveActivities) => {
          if (liveActivities && liveActivities.length > 0) {
            setActivities(liveActivities);
          }
        });

        // Real-time Firestore Listener for Crowd Readings
        unsubReadings = firestoreSync.subscribeToCrowdReadings((liveReadings) => {
          if (liveReadings && liveReadings.length > 0) {
            setReadings(liveReadings);
          }
        });
      } catch (err) {
        console.error('Failed to load admin dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    return () => {
      if (unsubReports) unsubReports();
      if (unsubActivities) unsubActivities();
      if (unsubReadings) unsubReadings();
    };
  }, []);

  // Inline Quick Actions: Verify or Reject Report
  const handleReviewReport = async (report: CrowdReport, action: 'verified' | 'rejected') => {
    setProcessingId(report.id);
    setActionSuccess(null);

    const reviewerName = user?.displayName || 'Admin Control Room';
    const notes = action === 'verified' ? 'Verified against station telemetry' : 'Rejected after inspection';

    try {
      // 1. Update in Firestore directly in real time
      await firestoreSync.reviewReportInFirestore(report.id, action, reviewerName, notes, report);

      // 2. Also notify backend API
      try {
        await api.reviewReport(report.id, action, notes);
      } catch (e) {
        console.warn('Backend sync warning:', e);
      }

      // Update local state immediately
      setReports((prev) =>
        prev.map((r) =>
          r.id === report.id
            ? {
                ...r,
                status: action,
                verifiedBy: reviewerName,
                verifiedAt: new Date().toISOString(),
                reviewNotes: notes
              }
            : r
        )
      );

      setActionSuccess(`Report for ${report.stationName} marked as ${action.toUpperCase()}`);
      setTimeout(() => setActionSuccess(null), 4000);
    } catch (err: any) {
      console.error('Failed to review report:', err);
      alert('Could not update report: ' + (err.message || 'Unknown error'));
    } finally {
      setProcessingId(null);
    }
  };

  // Filtered reports
  const filteredReports = reports.filter((r) => {
    if (reportFilter === 'all') return true;
    return r.status === reportFilter;
  });

  const pendingCount = reports.filter((r) => r.status === 'pending').length;
  const verifiedCount = reports.filter((r) => r.status === 'verified').length;
  const rejectedCount = reports.filter((r) => r.status === 'rejected').length;

  const highCrowdCount = readings.filter((r) => r.crowdLevel === 'high').length;
  const mediumCrowdCount = readings.filter((r) => r.crowdLevel === 'medium').length;
  const lowCrowdCount = readings.filter((r) => r.crowdLevel === 'low').length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Top Banner with Real-time Firestore Status */}
      <div className="bg-gradient-to-r from-transit-navy via-slate-900 to-transit-navy text-white rounded-2xl p-6 shadow-xl flex flex-wrap items-center justify-between gap-4 border border-white/10 relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex flex-wrap items-center gap-2 mb-1.5">
            <span className="text-[11px] font-mono font-semibold text-teal-300 uppercase tracking-wider bg-white/10 px-2 py-0.5 rounded border border-white/10">
              Operations Control Center
            </span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>Real-Time Firestore Database Active</span>
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white mt-1">
            Admin Management Desk &amp; Rush Stream
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl">
            Live surveillance and instant moderation of Mumbai suburban railways, metro lines, and commuter crowd rush reports.
          </p>
        </div>

        <div className="flex items-center gap-2 relative z-10">
          <button
            onClick={() => navigate('/admin/notifications')}
            className="px-3.5 py-2 bg-rose-600 hover:bg-rose-700 active:scale-95 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-all shadow-xs"
          >
            <Bell size={14} className="hover:rotate-12 transition-transform" />
            <span>Broadcast Alert</span>
          </button>
          <button
            onClick={() => navigate('/admin/transport')}
            className="px-3.5 py-2 bg-white/10 hover:bg-white/20 active:scale-95 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-all border border-white/20"
          >
            <Plus size={14} />
            <span>Manage Stations</span>
          </button>
        </div>
      </div>

      {/* KPI Cards with Live Numbers */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3.5">
        <div className="bg-white border border-slate-200/90 hover:border-teal-300 rounded-2xl p-4 shadow-2xs hover:shadow-card hover:-translate-y-0.5 transition-all">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
            Total Stations &amp; Stops
          </span>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-2xl font-bold text-transit-navy">
              <CountUp end={stations.length} duration={900} />
            </span>
            <Train size={18} className="text-transit-teal" />
          </div>
          <span className="text-[10px] text-slate-400 mt-1 block">WR, CR, HR, Metro &amp; Bus</span>
        </div>

        <div className="bg-white border border-slate-200/90 hover:border-teal-300 rounded-2xl p-4 shadow-2xs hover:shadow-card hover:-translate-y-0.5 transition-all">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
            Active Corridors
          </span>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-2xl font-bold text-transit-navy">
              <CountUp end={lines.length} duration={900} />
            </span>
            <Activity size={18} className="text-sky-600" />
          </div>
          <span className="text-[10px] text-slate-400 mt-1 block">Suburban &amp; Metro lines</span>
        </div>

        <div className="bg-white border border-slate-200/90 hover:border-rose-300 rounded-2xl p-4 shadow-2xs hover:shadow-card hover:-translate-y-0.5 transition-all">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
            High Density (SDCL)
          </span>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-2xl font-bold text-rose-600">
              <CountUp end={highCrowdCount} duration={900} />
            </span>
            <AlertTriangle size={18} className="text-rose-500 animate-pulse" />
          </div>
          <span className="text-[10px] text-rose-700 mt-1 block">&gt;75% crush load stations</span>
        </div>

        <div className="bg-white border border-amber-200 hover:border-amber-400 rounded-2xl p-4 shadow-2xs hover:shadow-card hover:-translate-y-0.5 transition-all bg-amber-50/20">
          <span className="text-[11px] font-semibold text-amber-800 uppercase tracking-wider block">
            Pending Rush Reports
          </span>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-2xl font-bold text-amber-700">
              <CountUp end={pendingCount} duration={900} />
            </span>
            <CheckSquare size={18} className="text-amber-600" />
          </div>
          <span className="text-[10px] text-amber-700 mt-1 block">Live commuter reports</span>
        </div>

        <div className="bg-white border border-slate-200/90 hover:border-teal-300 rounded-2xl p-4 shadow-2xs hover:shadow-card hover:-translate-y-0.5 transition-all col-span-2 md:col-span-1">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
            Total Rush Submissions
          </span>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-2xl font-bold text-transit-teal">
              <CountUp end={reports.length} duration={900} />
            </span>
            <Send size={18} className="text-transit-teal" />
          </div>
          <span className="text-[10px] text-slate-400 mt-1 block">Stored in Firestore</span>
        </div>
      </div>

      {actionSuccess && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2 shadow-2xs"
        >
          <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
          <span>{actionSuccess}</span>
        </motion.div>
      )}

      {/* Main Grid: Live Rush Reports on Left (7 cols), Live Activities & Telemetry on Right (5 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Commuter Rush Reports Stream & Moderation Desk */}
        <div className="lg:col-span-7 bg-white border border-slate-200/90 rounded-2xl p-5 shadow-card space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base text-transit-navy flex items-center gap-1.5">
                  <CheckSquare size={18} className="text-transit-teal" />
                  <span>Commuter Rush Reports (Live Stream)</span>
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                  Live Sync
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Real-time commuter crowd reports from Firebase Firestore. Verify or reject directly with one click.
              </p>
            </div>

            <Link
              to="/admin/reports"
              className="text-xs text-transit-teal font-semibold hover:underline flex items-center gap-1 shrink-0"
            >
              <span>Full Moderation Desk</span>
              <ChevronRight size={14} />
            </Link>
          </div>

          {/* Report Filter Tabs */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-100/80 rounded-xl border border-slate-200/70 text-xs overflow-x-auto">
            <button
              type="button"
              onClick={() => setReportFilter('pending')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all flex items-center gap-1.5 ${
                reportFilter === 'pending'
                  ? 'bg-amber-600 text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>Pending Review</span>
              <span className="px-1.5 py-0.2 rounded-full bg-white/20 text-[10px] font-mono">
                {pendingCount}
              </span>
            </button>
            <button
              type="button"
              onClick={() => setReportFilter('verified')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all flex items-center gap-1.5 ${
                reportFilter === 'verified'
                  ? 'bg-emerald-700 text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>Verified</span>
              <span className="px-1.5 py-0.2 rounded-full bg-white/20 text-[10px] font-mono">
                {verifiedCount}
              </span>
            </button>
            <button
              type="button"
              onClick={() => setReportFilter('rejected')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all flex items-center gap-1.5 ${
                reportFilter === 'rejected'
                  ? 'bg-rose-700 text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>Rejected</span>
              <span className="px-1.5 py-0.2 rounded-full bg-white/20 text-[10px] font-mono">
                {rejectedCount}
              </span>
            </button>
            <button
              type="button"
              onClick={() => setReportFilter('all')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all flex items-center gap-1.5 ${
                reportFilter === 'all'
                  ? 'bg-transit-navy text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>All ({reports.length})</span>
            </button>
          </div>

          {/* Reports List */}
          <div className="space-y-3 max-h-[480px] overflow-y-auto pr-1">
            {filteredReports.length === 0 ? (
              <div className="p-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200">
                <CheckSquare size={32} className="mx-auto text-slate-300 mb-2" />
                <p className="text-sm font-semibold text-slate-700">
                  No {reportFilter !== 'all' ? reportFilter : ''} crowd reports found
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  New submissions from commuters on the &quot;Report Rush&quot; page will stream here in real-time.
                </p>
              </div>
            ) : (
              filteredReports.map((report) => {
                const isPending = report.status === 'pending';
                const isVerified = report.status === 'verified';
                const isRejected = report.status === 'rejected';

                return (
                  <motion.div
                    key={report.id}
                    layout
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`p-3.5 rounded-xl border transition-all text-xs flex flex-col gap-2.5 ${
                      isPending
                        ? 'bg-amber-50/40 border-amber-200/90 shadow-2xs'
                        : isVerified
                        ? 'bg-emerald-50/30 border-emerald-200/80'
                        : 'bg-slate-50 border-slate-200 text-slate-500'
                    }`}
                  >
                    {/* Header Row */}
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900 text-sm">
                            {report.stationName}
                          </span>
                          <span className="capitalize px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 text-[10px] font-semibold border border-slate-200">
                            {report.mode}
                          </span>
                          {report.direction && (
                            <span className="text-[10px] text-slate-500 font-mono">
                              [{report.direction}]
                            </span>
                          )}
                        </div>

                        <div className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-2">
                          <span>
                            Reported by <strong>{report.userName}</strong>
                          </span>
                          <span>&bull;</span>
                          <span className="flex items-center gap-1 text-slate-400">
                            <Clock size={11} />
                            {new Date(report.timestamp).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <CrowdBadge level={report.crowdLevel} size="sm" />
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                            isPending
                              ? 'bg-amber-100 text-amber-800 border border-amber-200'
                              : isVerified
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                              : 'bg-rose-100 text-rose-800 border border-rose-200'
                          }`}
                        >
                          {report.status}
                        </span>
                      </div>
                    </div>

                    {/* Commuter Notes */}
                    {report.notes && (
                      <div className="p-2.5 rounded-lg bg-white/90 border border-slate-200/70 text-slate-700 italic text-[11px]">
                        &ldquo;{report.notes}&rdquo;
                      </div>
                    )}

                    {/* Details row: coach type & review metadata */}
                    <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-100">
                      <div className="flex items-center gap-2">
                        {report.coachType && (
                          <span className="capitalize bg-slate-100 px-2 py-0.5 rounded font-mono text-[10px]">
                            Coach: {report.coachType}
                          </span>
                        )}
                        {report.verifiedBy && (
                          <span className="text-[10px] text-slate-400">
                            Reviewed by: {report.verifiedBy}
                          </span>
                        )}
                      </div>

                      {/* Inline Actions */}
                      <div className="flex items-center gap-1.5">
                        {isPending ? (
                          <>
                            <button
                              type="button"
                              onClick={() => handleReviewReport(report, 'verified')}
                              disabled={processingId === report.id}
                              className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-semibold rounded-lg flex items-center gap-1 transition-all disabled:opacity-50"
                            >
                              <Check size={12} />
                              <span>Verify</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => handleReviewReport(report, 'rejected')}
                              disabled={processingId === report.id}
                              className="px-2.5 py-1 bg-rose-600 hover:bg-rose-700 active:scale-95 text-white font-semibold rounded-lg flex items-center gap-1 transition-all disabled:opacity-50"
                            >
                              <X size={12} />
                              <span>Reject</span>
                            </button>
                          </>
                        ) : (
                          <span className="text-[10px] font-semibold text-slate-400">
                            Processed &bull; {new Date(report.verifiedAt || report.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })
            )}
          </div>
        </div>

        {/* Right: Real-Time Activity Feed & Audit Stream (5 cols) */}
        <div className="lg:col-span-5 space-y-5">
          {/* Real-Time Activities Timeline Card */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-card space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-base text-transit-navy flex items-center gap-1.5">
                    <Activity size={18} className="text-emerald-600" />
                    <span>Real-Time Activity Feed</span>
                  </h3>
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Live Firestore activity log: passenger submissions &amp; control operations.
                </p>
              </div>

              <span className="text-[10px] font-mono bg-slate-100 px-2 py-0.5 rounded text-slate-600 border border-slate-200">
                {activities.length} Events
              </span>
            </div>

            {/* Activities Timeline */}
            <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
              {activities.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-400 bg-slate-50 rounded-xl">
                  Waiting for incoming system activities...
                </div>
              ) : (
                activities.map((act) => {
                  const isSubmitted = act.type === 'report_submitted';
                  const isVerified = act.type === 'report_verified';
                  const isRejected = act.type === 'report_rejected';

                  return (
                    <motion.div
                      key={act.id}
                      initial={{ opacity: 0, x: 6 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="p-3 bg-slate-50 hover:bg-slate-100/70 rounded-xl border border-slate-200/80 transition-colors text-xs flex items-start gap-3"
                    >
                      <div
                        className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                          isSubmitted
                            ? 'bg-amber-100 text-amber-800'
                            : isVerified
                            ? 'bg-emerald-100 text-emerald-800'
                            : isRejected
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-teal-100 text-teal-800'
                        }`}
                      >
                        {isSubmitted ? (
                          <Send size={13} />
                        ) : isVerified ? (
                          <CheckCircle2 size={13} />
                        ) : isRejected ? (
                          <XCircle size={13} />
                        ) : (
                          <Activity size={13} />
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <h4 className="font-bold text-slate-900 text-xs truncate">
                            {act.title}
                          </h4>
                          <span className="text-[10px] text-slate-400 shrink-0 font-mono">
                            {new Date(act.timestamp).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-600 mt-0.5 leading-relaxed">
                          {act.description}
                        </p>
                        <div className="flex items-center gap-2 mt-1 text-[10px] text-slate-400">
                          <span>By: <strong>{act.actor}</strong></span>
                          {act.crowdLevel && (
                            <span className="capitalize text-slate-500 font-medium">
                              &bull; {act.crowdLevel} rush
                            </span>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  );
                })
              )}
            </div>
          </div>

          {/* Network Crowd Breakdown */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-card space-y-4">
            <h3 className="font-bold text-base text-transit-navy">
              Network Crowd Distribution
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="flex items-center gap-1.5 text-emerald-800 font-medium">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" />
                    Comfortable / Seated (&lt;40%)
                  </span>
                  <span className="font-bold font-mono">{lowCrowdCount} Stations</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2">
                  <div
                    className="bg-emerald-600 h-2 rounded-full transition-all duration-500"
                    style={{
                      width: `${readings.length > 0 ? (lowCrowdCount / readings.length) * 100 : 33}%`
                    }}
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="flex items-center gap-1.5 text-amber-800 font-medium">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                    Moderate Rush (40-75%)
                  </span>
                  <span className="font-bold font-mono">{mediumCrowdCount} Stations</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2">
                  <div
                    className="bg-amber-500 h-2 rounded-full transition-all duration-500"
                    style={{
                      width: `${readings.length > 0 ? (mediumCrowdCount / readings.length) * 100 : 33}%`
                    }}
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="flex items-center gap-1.5 text-rose-800 font-medium">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-600" />
                    Super Dense Crush Load - SDCL (&gt;75%)
                  </span>
                  <span className="font-bold font-mono">{highCrowdCount} Stations</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2">
                  <div
                    className="bg-rose-600 h-2 rounded-full transition-all duration-500"
                    style={{
                      width: `${readings.length > 0 ? (highCrowdCount / readings.length) * 100 : 33}%`
                    }}
                  />
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100">
              <Link
                to="/admin/crowd"
                className="text-xs font-semibold text-transit-teal hover:underline flex items-center justify-between"
              >
                <span>Open Real-Time Crowd Monitor</span>
                <ArrowRight size={13} />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

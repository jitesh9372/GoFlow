import React, { useState, useEffect } from 'react';
import {
  CheckSquare,
  CheckCircle,
  XCircle,
  Clock,
  MessageSquare,
  Search,
  Filter,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';
import { api } from '../../services/api';
import { firestoreSync } from '../../services/firestoreService';
import { useAuth } from '../../context/AuthContext';
import { CrowdReport } from '../../types';
import { CrowdBadge } from '../../components/CrowdBadge';

export const PassengerReportsPage: React.FC = () => {
  const { user } = useAuth();
  const [reports, setReports] = useState<CrowdReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'verified' | 'rejected'>('all');
  const [search, setSearch] = useState('');
  const [feedback, setFeedback] = useState<string | null>(null);

  // Review modal
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [activeReport, setActiveReport] = useState<CrowdReport | null>(null);
  const [reviewAction, setReviewAction] = useState<'verified' | 'rejected'>('verified');
  const [reviewNotes, setReviewNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const res = await api.getReports(statusFilter === 'all' ? undefined : statusFilter);
      setReports(res.reports);
    } catch (err) {
      console.error('Error fetching reports:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let unsubFirestore: (() => void) | undefined;
    fetchReports();

    unsubFirestore = firestoreSync.subscribeToCrowdReports((liveReports) => {
      if (liveReports && liveReports.length > 0) {
        if (statusFilter === 'all') {
          setReports(liveReports);
        } else {
          setReports(liveReports.filter(r => r.status === statusFilter));
        }
      }
    });

    return () => {
      if (unsubFirestore) unsubFirestore();
    };
  }, [statusFilter]);

  const handleOpenReview = (report: CrowdReport, action: 'verified' | 'rejected') => {
    setActiveReport(report);
    setReviewAction(action);
    setReviewNotes(action === 'verified' ? 'Verified against station CCTV / gate flow data.' : 'Inconsistent with live sensor readings.');
    setReviewModalOpen(true);
  };

  const handleConfirmReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeReport) return;

    setSubmitting(true);
    const reviewerName = user?.displayName || 'Admin Control Room';
    try {
      // 1. Sync to Firestore in real time
      await firestoreSync.reviewReportInFirestore(
        activeReport.id,
        reviewAction,
        reviewerName,
        reviewNotes,
        activeReport
      );

      // 2. Also notify backend
      try {
        await api.reviewReport(activeReport.id, reviewAction, reviewNotes);
      } catch (e) {
        console.warn('Backend sync:', e);
      }

      setReports(reports.map(r => (r.id === activeReport.id ? { ...r, status: reviewAction, reviewNotes, verifiedBy: reviewerName, verifiedAt: new Date().toISOString() } : r)));
      setReviewModalOpen(false);
      setFeedback(`Report for ${activeReport.stationName} marked as ${reviewAction}!`);
      setTimeout(() => setFeedback(null), 4000);
    } catch (err: any) {
      alert('Error updating report: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const filtered = reports.filter(r => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      r.stationName.toLowerCase().includes(q) ||
      r.userName.toLowerCase().includes(q) ||
      (r.notes && r.notes.toLowerCase().includes(q))
    );
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Header */}
      <div className="border-b border-slate-200 pb-4">
        <h1 className="text-2xl font-bold text-transit-navy tracking-tight flex items-center gap-2">
          <CheckSquare size={24} className="text-transit-teal" />
          <span>Passenger Crowd Reports Moderation Desk</span>
        </h1>
        <p className="text-xs text-transit-muted mt-1">
          Review crowd submissions from commuters. Verified reports automatically update live telemetry on the public map.
        </p>
      </div>

      {feedback && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-transit flex items-center gap-2">
          <CheckCircle size={15} className="text-emerald-600" />
          <span>{feedback}</span>
        </div>
      )}

      {/* Filter Bar */}
      <div className="bg-white border border-transit-border rounded-card p-3 shadow-subtle flex flex-wrap items-center justify-between gap-3">
        <div className="relative flex-1 min-w-[240px]">
          <Search size={15} className="absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search report by station, commuter name, or keywords..."
            className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-200 rounded-transit focus:outline-none focus:ring-1 focus:ring-transit-teal"
          />
        </div>

        <div className="flex items-center gap-1 text-xs font-medium">
          <span className="text-slate-400 uppercase text-[10px] mr-1">Status:</span>
          {(['all', 'pending', 'verified', 'rejected'] as const).map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-2.5 py-1 rounded capitalize transition-colors ${
                statusFilter === s
                  ? 'bg-transit-teal text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Reports Table */}
      <div className="bg-white border border-transit-border rounded-card shadow-card overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider">
            <tr>
              <th className="py-2.5 px-3">Transit Station</th>
              <th className="py-2.5 px-3">Commuter</th>
              <th className="py-2.5 px-3">Crowd Rating</th>
              <th className="py-2.5 px-3">Coach / Direction</th>
              <th className="py-2.5 px-3">Report Details</th>
              <th className="py-2.5 px-3">Status</th>
              <th className="py-2.5 px-3 text-right">Moderation Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.map((report) => (
              <tr key={report.id} className="hover:bg-slate-50/70 transition-colors">
                <td className="py-3 px-3">
                  <span className="font-bold text-transit-navy text-sm block">
                    {report.stationName}
                  </span>
                  <span className="text-[11px] text-slate-400 capitalize font-mono">
                    {report.mode}
                  </span>
                </td>
                <td className="py-3 px-3">
                  <div className="font-medium text-slate-800">{report.userName}</div>
                  <div className="text-[10px] text-slate-400">{report.userEmail}</div>
                </td>
                <td className="py-3 px-3">
                  <CrowdBadge level={report.crowdLevel} size="sm" />
                </td>
                <td className="py-3 px-3 text-slate-600">
                  <div>{report.coachType ? report.coachType.replace('_', ' ') : 'General'}</div>
                  <div className="text-[10px] text-slate-400 truncate max-w-[150px]">
                    {report.direction || 'Platform Concourse'}
                  </div>
                </td>
                <td className="py-3 px-3 max-w-xs">
                  {report.notes ? (
                    <p className="text-slate-700 italic truncate" title={report.notes}>
                      &ldquo;{report.notes}&rdquo;
                    </p>
                  ) : (
                    <span className="text-slate-400 italic">No notes</span>
                  )}
                  <span className="text-[10px] text-slate-400 block mt-0.5 font-mono">
                    {new Date(report.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </td>
                <td className="py-3 px-3">
                  <span
                    className={`inline-block px-2 py-0.5 rounded text-[11px] font-mono capitalize border ${
                      report.status === 'verified'
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                        : report.status === 'pending'
                        ? 'bg-amber-50 text-amber-800 border-amber-200'
                        : 'bg-slate-100 text-slate-600 border-slate-200'
                    }`}
                  >
                    {report.status}
                  </span>
                </td>
                <td className="py-3 px-3 text-right">
                  {report.status === 'pending' ? (
                    <div className="inline-flex items-center gap-1.5">
                      <button
                        onClick={() => handleOpenReview(report, 'verified')}
                        className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[11px] font-semibold transition-colors flex items-center gap-1"
                      >
                        <CheckCircle size={12} />
                        <span>Verify</span>
                      </button>
                      <button
                        onClick={() => handleOpenReview(report, 'rejected')}
                        className="px-2.5 py-1 bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-700 border border-slate-200 rounded text-[11px] font-semibold transition-colors flex items-center gap-1"
                      >
                        <XCircle size={12} />
                        <span>Reject</span>
                      </button>
                    </div>
                  ) : (
                    <span className="text-[11px] text-slate-400 font-mono">
                      Reviewed
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Review Confirmation Modal */}
      {reviewModalOpen && activeReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-card border border-transit-border shadow-elevated w-full max-w-md overflow-hidden">
            <div className={`px-5 py-3 text-white flex items-center justify-between ${
              reviewAction === 'verified' ? 'bg-emerald-700' : 'bg-slate-800'
            }`}>
              <h3 className="font-semibold text-sm">
                {reviewAction === 'verified' ? 'Verify Crowd Report' : 'Reject Crowd Report'}
              </h3>
              <button
                onClick={() => setReviewModalOpen(false)}
                className="text-white/70 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleConfirmReview} className="p-5 space-y-3.5 text-xs">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-transit space-y-1">
                <span className="font-bold text-slate-900 text-sm block">
                  {activeReport.stationName}
                </span>
                <p className="text-slate-600">
                  Reported by {activeReport.userName} ({activeReport.crowdLevel.toUpperCase()} load)
                </p>
                {activeReport.notes && (
                  <p className="text-slate-500 italic mt-1">
                    &ldquo;{activeReport.notes}&rdquo;
                  </p>
                )}
              </div>

              <div>
                <label className="block font-semibold text-slate-700 uppercase mb-1">
                  Moderator Review Notes
                </label>
                <textarea
                  rows={2}
                  required
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-slate-200 rounded-transit focus:outline-none focus:ring-1 focus:ring-transit-teal text-xs resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t">
                <button
                  type="button"
                  onClick={() => setReviewModalOpen(false)}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded font-semibold text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className={`px-4 py-1.5 text-white rounded font-semibold text-xs ${
                    reviewAction === 'verified'
                      ? 'bg-emerald-600 hover:bg-emerald-700'
                      : 'bg-rose-600 hover:bg-rose-700'
                  }`}
                >
                  {submitting ? 'Processing...' : reviewAction === 'verified' ? 'Confirm & Publish Reading' : 'Reject Report'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

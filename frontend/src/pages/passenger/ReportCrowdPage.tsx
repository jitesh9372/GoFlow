import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Send, CheckCircle, AlertCircle, Clock, Users, Train, Filter, MessageSquare } from 'lucide-react';
import { Station, TransitLine, CrowdReport, TransportMode, CoachType, CrowdLevel } from '../../types';
import { api } from '../../services/api';
import { firestoreSync } from '../../services/firestoreService';
import { useAuth } from '../../context/AuthContext';
import { StationSearchInput } from '../../components/StationSearchInput';
import { CrowdBadge } from '../../components/CrowdBadge';
import { ModeIcon } from '../../components/ModeIcon';

export const ReportCrowdPage: React.FC = () => {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();

  const [stations, setStations] = useState<Station[]>([]);
  const [lines, setLines] = useState<TransitLine[]>([]);
  const [reports, setReports] = useState<CrowdReport[]>([]);

  // Form fields
  const [selectedStation, setSelectedStation] = useState<Station | null>(null);
  const [mode, setMode] = useState<TransportMode>('train');
  const [lineId, setLineId] = useState<string>('');
  const [crowdLevel, setCrowdLevel] = useState<CrowdLevel>('medium');
  const [coachType, setCoachType] = useState<CoachType>('general');
  const [direction, setDirection] = useState<string>('');
  const [notes, setNotes] = useState<string>('');

  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    let unsubscribeFirestore: (() => void) | undefined;

    const fetchData = async () => {
      try {
        const [stnRes, lineRes, repRes] = await Promise.all([
          api.getStations(),
          api.getLines(),
          api.getReports()
        ]);
        setStations(stnRes.stations);
        setLines(lineRes.lines);
        setReports(repRes.reports);

        // Seed Firestore if empty
        firestoreSync.seedInitialDataIfEmpty(repRes.reports, []);

        const stationIdParam = searchParams.get('stationId');
        if (stationIdParam) {
          const match = stnRes.stations.find(s => s.id === stationIdParam);
          if (match) {
            setSelectedStation(match);
            setMode(match.mode);
          }
        }

        // Subscribe to live Firestore reports updates
        unsubscribeFirestore = firestoreSync.subscribeToCrowdReports((liveReports) => {
          if (liveReports && liveReports.length > 0) {
            setReports(liveReports);
          }
        });
      } catch (err) {
        console.error('Failed to load data:', err);
      }
    };
    fetchData();

    return () => {
      if (unsubscribeFirestore) unsubscribeFirestore();
    };
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStation) {
      setErrorMsg('Please pick a transit station or bus stop.');
      return;
    }
    setErrorMsg(null);
    setSubmitting(true);

    try {
      let savedReport: CrowdReport;
      try {
        const res = await api.submitReport({
          stationId: selectedStation.id,
          stationName: selectedStation.name,
          mode,
          lineId: lineId || undefined,
          crowdLevel,
          coachType,
          direction: direction.trim() || undefined,
          notes: notes.trim() || undefined
        });
        savedReport = res.report;
      } catch {
        savedReport = {
          id: `rep-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          userId: user?.uid || 'passenger-live',
          userEmail: user?.email || 'commuter@mumbai.transit',
          userName: user?.displayName || 'Mumbai Commuter',
          stationId: selectedStation.id,
          stationName: selectedStation.name,
          mode,
          lineId: lineId || undefined,
          crowdLevel,
          coachType,
          direction: direction.trim() || undefined,
          notes: notes.trim() || undefined,
          status: 'pending',
          timestamp: new Date().toISOString()
        };
      }

      // Sync to Firestore in real time!
      await firestoreSync.saveReportToFirestore(savedReport);

      setReports(prev => [savedReport, ...prev.filter(r => r.id !== savedReport.id)]);
      setSuccessMsg(`Crowd report for ${selectedStation.name} submitted successfully! Synced to Live Control Room in real-time.`);
      setNotes('');
      setDirection('');
      setTimeout(() => setSuccessMsg(null), 5000);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to submit crowd report.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Header */}
      <div className="bg-white border border-transit-border rounded-card p-5 shadow-subtle flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 rounded-transit bg-teal-50 text-transit-teal flex items-center justify-center">
              <Send size={16} />
            </div>
            <h1 className="text-xl font-bold text-transit-navy tracking-tight">Crowd Rush Reporting</h1>
            <span className="text-xs px-2 py-0.5 rounded bg-teal-50 text-transit-teal border border-teal-200 font-mono">
              Crowdsourced Intelligence
            </span>
          </div>
          <p className="text-xs text-transit-muted mt-0.5 ml-10">
            Help fellow Mumbai commuters avoid crush load. Reports are verified by transit administrators and update the live crowd map.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Form */}
        <div className="lg:col-span-5 bg-white border border-transit-border rounded-card p-5 shadow-card space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="font-bold text-base text-transit-navy">
              Submit Live Crowd Report
            </h3>
            <p className="text-xs text-transit-muted mt-0.5">
              Accurately describe platform, coach type, and density
            </p>
          </div>

          {successMsg && (
            <div className="p-3 rounded-transit bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
              <CheckCircle size={15} className="shrink-0 text-emerald-600" />
              <span>{successMsg}</span>
            </div>
          )}

          {errorMsg && (
            <div className="p-3 rounded-transit bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
              <AlertCircle size={15} className="shrink-0 text-rose-600" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            {/* Station Search */}
            <StationSearchInput
              label="Station / Transit Stop *"
              placeholder="Search station or bus stop..."
              selectedStationId={selectedStation?.id}
              stations={stations}
              onSelectStation={(stn) => {
                setSelectedStation(stn);
                if (stn) setMode(stn.mode);
              }}
            />

            {/* Mode Selector */}
            <div>
              <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Transport Mode
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['train', 'metro', 'bus'] as TransportMode[]).map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setMode(m)}
                    className={`py-2 px-2.5 rounded-transit border font-medium flex items-center justify-center gap-1.5 capitalize transition-colors ${
                      mode === m
                        ? 'border-transit-teal bg-teal-50 text-transit-teal font-semibold'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <ModeIcon mode={m} size={14} />
                    <span>{m === 'train' ? 'Local Train' : m === 'metro' ? 'Metro' : 'BEST Bus'}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Crowd Level Rating */}
            <div>
              <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Observed Crowd Density *
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setCrowdLevel('low')}
                  className={`p-2.5 rounded-transit border text-center transition-colors ${
                    crowdLevel === 'low'
                      ? 'border-emerald-600 bg-emerald-50 text-emerald-900 font-semibold'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <span className="block font-semibold text-xs">Comfortable</span>
                  <span className="block text-[10px] text-emerald-700">&lt;40% seated</span>
                </button>

                <button
                  type="button"
                  onClick={() => setCrowdLevel('medium')}
                  className={`p-2.5 rounded-transit border text-center transition-colors ${
                    crowdLevel === 'medium'
                      ? 'border-amber-600 bg-amber-50 text-amber-900 font-semibold'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <span className="block font-semibold text-xs">Moderate</span>
                  <span className="block text-[10px] text-amber-700">40-75% standee</span>
                </button>

                <button
                  type="button"
                  onClick={() => setCrowdLevel('high')}
                  className={`p-2.5 rounded-transit border text-center transition-colors ${
                    crowdLevel === 'high'
                      ? 'border-rose-600 bg-rose-50 text-rose-900 font-semibold'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <span className="block font-semibold text-xs">Dense SDCL</span>
                  <span className="block text-[10px] text-rose-700">&gt;75% crush load</span>
                </button>
              </div>
            </div>

            {/* Coach Type */}
            {mode === 'train' && (
              <div>
                <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Coach Category
                </label>
                <select
                  value={coachType}
                  onChange={(e) => setCoachType(e.target.value as CoachType)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-transit text-slate-800 text-xs focus:outline-none focus:ring-1 focus:ring-transit-teal"
                >
                  <option value="general">Second Class / General Compartment</option>
                  <option value="ladies">Ladies Compartment (Second &amp; First Class)</option>
                  <option value="first_class">First Class Compartment</option>
                  <option value="ac">Air Conditioned (AC Local Train)</option>
                  <option value="all">Entire Train / Platform Concourse</option>
                </select>
              </div>
            )}

            {/* Platform & Direction */}
            <div>
              <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Direction / Platform Stoppage
              </label>
              <input
                type="text"
                value={direction}
                onChange={(e) => setDirection(e.target.value)}
                placeholder="e.g. Platform 4 Fast towards Churchgate / Virar"
                className="w-full px-3 py-2 border border-slate-200 rounded-transit text-slate-800 text-xs focus:outline-none focus:ring-1 focus:ring-transit-teal"
              />
            </div>

            {/* Notes */}
            <div>
              <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Additional Observations
              </label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. Trains running with 5-min delay, southern staircase jammed..."
                className="w-full px-3 py-2 border border-slate-200 rounded-transit text-slate-800 text-xs focus:outline-none focus:ring-1 focus:ring-transit-teal resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={submitting || !selectedStation}
              className="w-full py-2.5 bg-transit-teal hover:bg-transit-teal-hover text-white font-semibold rounded-transit flex items-center justify-center gap-2 transition-colors disabled:opacity-50 shadow-xs"
            >
              <Send size={14} />
              <span>{submitting ? 'Submitting Report...' : 'Broadcast Crowd Report'}</span>
            </button>
          </form>
        </div>

        {/* Right Column: Community Reports Feed */}
        <div className="lg:col-span-7 space-y-3">
          <div className="flex items-center justify-between text-xs text-transit-muted px-1">
            <span className="font-semibold text-transit-navy uppercase tracking-wider flex items-center gap-1.5">
              <Users size={14} className="text-transit-teal" />
              Community Transit Reports Feed
            </span>
            <span>{reports.length} total reports</span>
          </div>

          <div className="space-y-3">
            {reports.map((rep) => {
              const statusBadge = {
                verified: 'bg-emerald-50 text-emerald-800 border-emerald-200',
                pending: 'bg-amber-50 text-amber-800 border-amber-200',
                rejected: 'bg-slate-100 text-slate-600 border-slate-200'
              }[rep.status];

              return (
                <div
                  key={rep.id}
                  className="bg-white border border-transit-border rounded-card p-4 shadow-subtle flex flex-col gap-2"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-transit-navy text-sm">
                          {rep.stationName}
                        </span>
                        <span className="text-[11px] px-1.5 py-0.2 rounded bg-slate-100 text-slate-700 capitalize">
                          {rep.mode}
                        </span>
                        {rep.coachType && rep.coachType !== 'all' && (
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-teal-50 text-teal-800 border border-teal-100 capitalize font-mono">
                            {rep.coachType.replace('_', ' ')}
                          </span>
                        )}
                      </div>

                      {rep.direction && (
                        <p className="text-xs text-slate-600 mt-0.5">
                          {rep.direction}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <CrowdBadge level={rep.crowdLevel} size="sm" />
                      <span className={`text-[10px] font-mono font-medium px-2 py-0.5 rounded border capitalize ${statusBadge}`}>
                        {rep.status}
                      </span>
                    </div>
                  </div>

                  {rep.notes && (
                    <p className="text-xs text-slate-700 bg-slate-50/70 p-2 rounded border border-slate-100">
                      &ldquo;{rep.notes}&rdquo;
                    </p>
                  )}

                  <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-100">
                    <span>Reported by {rep.userName}</span>
                    <span className="font-mono">
                      {new Date(rep.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

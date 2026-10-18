import React, { useState } from 'react';
import { Compass, Bus, Train, Info, ShieldCheck, CreditCard, ChevronDown, ChevronUp, Zap, Clock } from 'lucide-react';
import { Station, RouteOption } from '../types';

interface TransitCorridorGuideProps {
  fromStation: Station | null;
  toStation: Station | null;
  routes: RouteOption[];
}

export const TransitCorridorGuide: React.FC<TransitCorridorGuideProps> = ({
  fromStation,
  toStation,
  routes
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'metro' | 'bus' | 'train'>('all');

  if (!fromStation || !toStation) return null;

  // Extract all metro lines and bus routes present in current route results
  const metroLinesFound: string[] = [];
  const busRoutesFound: string[] = [];

  routes.forEach(r => {
    r.steps.forEach(s => {
      if (s.mode === 'metro' && !metroLinesFound.includes(s.lineName)) {
        metroLinesFound.push(s.lineName);
      }
      if (s.mode === 'bus') {
        const name = s.busDetails?.busRouteNumber ? `Route ${s.busDetails.busRouteNumber}` : s.lineName;
        if (!busRoutesFound.includes(name)) {
          busRoutesFound.push(name);
        }
      }
    });
  });

  return (
    <div className="bg-gradient-to-r from-slate-50 via-teal-50/30 to-sky-50/30 border border-slate-200 rounded-card p-3 sm:p-4 text-xs transition-all shadow-subtle">
      <div className="flex items-center justify-between gap-3 cursor-pointer" onClick={() => setIsOpen(!isOpen)}>
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-teal-600 text-white flex items-center justify-center shrink-0">
            <Info size={14} />
          </div>
          <div>
            <h4 className="font-semibold text-transit-navy text-xs sm:text-sm">
              Transit Guide: Local Metro &amp; BEST Buses for this Corridor
            </h4>
            <p className="text-[11px] text-slate-500">
              {fromStation.name} ➔ {toStation.name} • Live Metro line codes, BEST feeder routes &amp; ticketing guide
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setIsOpen(!isOpen);
          }}
          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-transit bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 font-medium transition-colors"
        >
          <span>{isOpen ? 'Collapse' : 'View Transit Guide'}</span>
          {isOpen ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
        </button>
      </div>

      {isOpen && (
        <div className="mt-3 pt-3 border-t border-slate-200 space-y-3">
          {/* Tabs */}
          <div className="flex items-center gap-1.5 border-b border-slate-200 pb-2">
            <button
              type="button"
              onClick={() => setActiveTab('all')}
              className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors ${
                activeTab === 'all'
                  ? 'bg-teal-700 text-white'
                  : 'bg-white text-slate-600 hover:bg-slate-100'
              }`}
            >
              Overview
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('metro')}
              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded text-[11px] font-medium transition-colors ${
                activeTab === 'metro'
                  ? 'bg-sky-700 text-white'
                  : 'bg-white text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Compass size={12} />
              <span>Mumbai Metro (M1, M2A, M7, M3)</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('bus')}
              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded text-[11px] font-medium transition-colors ${
                activeTab === 'bus'
                  ? 'bg-amber-600 text-white'
                  : 'bg-white text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Bus size={12} />
              <span>BEST Buses &amp; Feeders</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('train')}
              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded text-[11px] font-medium transition-colors ${
                activeTab === 'train'
                  ? 'bg-emerald-700 text-white'
                  : 'bg-white text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Train size={12} />
              <span>Suburban Locals</span>
            </button>
          </div>

          {/* Tab Content: All / Overview */}
          {activeTab === 'all' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {/* Metro Card Summary */}
              <div className="bg-white p-3 rounded-transit border border-sky-100 shadow-2xs space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-sky-900 flex items-center gap-1.5">
                    <Compass size={14} className="text-sky-600" />
                    Local Metro Corridor Info
                  </span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-sky-50 text-sky-700 font-mono font-medium">
                    100% AC Trains
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  Fast, air-conditioned link across key east-west &amp; north-south junctions. Screen doors on Line 3 and automated fare gates across all lines.
                </p>
                <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px] text-slate-500">
                  <span className="flex items-center gap-1"><Clock size={11} className="text-sky-600" /> Headway: 3-5 mins</span>
                  <span className="flex items-center gap-1"><CreditCard size={11} className="text-sky-600" /> NCMC &amp; Mumbai 1 QR</span>
                </div>
              </div>

              {/* BEST Bus Summary */}
              <div className="bg-white p-3 rounded-transit border border-amber-100 shadow-2xs space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-amber-900 flex items-center gap-1.5">
                    <Bus size={14} className="text-amber-600" />
                    BEST Bus &amp; Feeder Network
                  </span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-50 text-amber-700 font-mono font-medium">
                    Chalo Smart Card
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  Depot-to-station feeder connectivity. Electric AC mini buses &amp; express corridors connect railway stations to office parks &amp; residential hubs.
                </p>
                <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px] text-slate-500">
                  <span className="flex items-center gap-1"><Zap size={11} className="text-amber-600" /> Electric AC Buses</span>
                  <span className="flex items-center gap-1"><CreditCard size={11} className="text-amber-600" /> UPI QR &amp; Cashless Fare</span>
                </div>
              </div>
            </div>
          )}

          {/* Tab Content: Metro */}
          {activeTab === 'metro' && (
            <div className="bg-white p-3.5 rounded-transit border border-slate-200 space-y-2.5">
              <h5 className="font-semibold text-slate-800 text-xs flex items-center gap-1.5">
                <Compass size={14} className="text-sky-600" />
                Mumbai Metro Lines Operating In Mumbai:
              </h5>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                <div className="p-2 rounded bg-sky-50/60 border border-sky-100">
                  <strong className="text-sky-900 block font-semibold">Line 1 (Blue Line): Versova – Andheri – Ghatkopar</strong>
                  <span className="text-slate-600">Interchanges: Andheri (WR), Ghatkopar (CR), Marol Naka (Line 3). Frequency: 3-4 mins.</span>
                </div>
                <div className="p-2 rounded bg-amber-50/60 border border-amber-100">
                  <strong className="text-amber-900 block font-semibold">Line 2A (Yellow Line): Dahisar East – Andheri West</strong>
                  <span className="text-slate-600">Interchanges: D.N. Nagar (Line 1), Dahisar East (Line 7). Frequency: 6 mins.</span>
                </div>
                <div className="p-2 rounded bg-rose-50/60 border border-rose-100">
                  <strong className="text-rose-900 block font-semibold">Line 7 (Red Line): Dahisar East – Gundavali (WEH)</strong>
                  <span className="text-slate-600">Interchanges: Gundavali / WEH (Line 1 Skywalk), Dahisar East (Line 2A). Frequency: 6 mins.</span>
                </div>
                <div className="p-2 rounded bg-cyan-50/60 border border-cyan-100">
                  <strong className="text-cyan-900 block font-semibold">Line 3 (Aqua Line): Aarey JVLR – SEEPZ – BKC</strong>
                  <span className="text-slate-600">Interchanges: Marol Naka (Line 1), CSMIA Airport T1 &amp; T2, BKC. Underground AC line.</span>
                </div>
              </div>
              <div className="text-[11px] text-slate-500 pt-1 flex items-center gap-1.5">
                <ShieldCheck size={13} className="text-emerald-600" />
                <span>All Metro stations feature automated AFC gates. You can tap National Common Mobility Cards (NCMC) or scan WhatsApp/Mumbai 1 app tickets.</span>
              </div>
            </div>
          )}

          {/* Tab Content: Bus */}
          {activeTab === 'bus' && (
            <div className="bg-white p-3.5 rounded-transit border border-slate-200 space-y-2.5">
              <h5 className="font-semibold text-slate-800 text-xs flex items-center gap-1.5">
                <Bus size={14} className="text-amber-600" />
                Key BEST Bus Routes Serving Commuters:
              </h5>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                <div className="p-2 rounded bg-slate-50 border border-slate-200">
                  <strong className="text-slate-900 block font-semibold">Route 332: Kurla West ➔ Andheri East</strong>
                  <span className="text-slate-600">Via Bail Bazar, Saki Naka, Marol Naka. Connects Central &amp; Western lines via Metro 1 belt.</span>
                </div>
                <div className="p-2 rounded bg-emerald-50 border border-emerald-100">
                  <strong className="text-emerald-900 block font-semibold">Route AS-4 AC: Borivali East ➔ BKC</strong>
                  <span className="text-slate-600">Express air-conditioned service via WEH, Goregaon, Andheri to Bandra Kurla Complex.</span>
                </div>
                <div className="p-2 rounded bg-sky-50 border border-sky-100">
                  <strong className="text-sky-900 block font-semibold">Route C-40 Express: Dadar East ➔ Nariman Point</strong>
                  <span className="text-slate-600">Connects Dadar central terminus with Byculla, CSMT, and Churchgate Mantralaya.</span>
                </div>
                <div className="p-2 rounded bg-amber-50 border border-amber-100">
                  <strong className="text-amber-900 block font-semibold">Route 312 AC: Prabhadevi / Dadar ➔ BKC</strong>
                  <span className="text-slate-600">Direct feeder between railway junction and BKC financial district every 10 mins.</span>
                </div>
              </div>
              <div className="text-[11px] text-slate-500 pt-1 flex items-center gap-1.5">
                <CreditCard size={13} className="text-amber-600" />
                <span>BEST fares start from ₹6 (Ordinary) and ₹10 (AC). Board from station east/west designated depot platforms. Chalo App &amp; contactless UPI accepted.</span>
              </div>
            </div>
          )}

          {/* Tab Content: Train */}
          {activeTab === 'train' && (
            <div className="bg-white p-3.5 rounded-transit border border-slate-200 space-y-2.5">
              <h5 className="font-semibold text-slate-800 text-xs flex items-center gap-1.5">
                <Train size={14} className="text-teal-700" />
                Mumbai Suburban Railway Services:
              </h5>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px]">
                <div className="p-2 rounded bg-teal-50 border border-teal-100">
                  <strong className="text-teal-900 block font-semibold">Western Railway (WR)</strong>
                  <span className="text-slate-600">Churchgate ➔ Dahanu Road. Fast locals skip small stations between Mumbai Central and Borivali.</span>
                </div>
                <div className="p-2 rounded bg-rose-50 border border-rose-100">
                  <strong className="text-rose-900 block font-semibold">Central Railway (CR)</strong>
                  <span className="text-slate-600">CSMT ➔ Kalyan / Karjat / Kasara. Fast local tracks between CSMT, Byculla, Dadar, Kurla, Ghatkopar, Thane.</span>
                </div>
                <div className="p-2 rounded bg-blue-50 border border-blue-100">
                  <strong className="text-blue-900 block font-semibold">Harbour Line (HR)</strong>
                  <span className="text-slate-600">CSMT ➔ Panvel / Goregaon. All slow locals serving Wadala, Kurla, Chembur, Vashi, Belapur.</span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

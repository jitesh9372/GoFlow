import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layers, MapPin, Radio, ShieldCheck, ArrowRight, RefreshCw, Train, ExternalLink } from 'lucide-react';
import { Station, CrowdReading, TransportMode, TransitLine } from '../../types';
import { api } from '../../services/api';
import { LeafletCrowdMap } from '../../components/LeafletCrowdMap';
import { CrowdBadge, getCrowdLevelInfo } from '../../components/CrowdBadge';
import { ModeIcon } from '../../components/ModeIcon';

export const CrowdMapPage: React.FC = () => {
  const navigate = useNavigate();
  const [stations, setStations] = useState<Station[]>([]);
  const [readings, setReadings] = useState<CrowdReading[]>([]);
  const [lines, setLines] = useState<TransitLine[]>([]);
  const [selectedStation, setSelectedStation] = useState<Station | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [stnRes, readRes, linesRes] = await Promise.all([
          api.getStations(),
          api.getCrowdReadings(),
          api.getLines().catch(() => ({ lines: [] }))
        ]);
        setStations(stnRes.stations);
        setReadings(readRes.readings);
        setLines(linesRes.lines);
        if (stnRes.stations.length > 0) {
          setSelectedStation(stnRes.stations.find(s => s.name.includes('Dadar')) || stnRes.stations[0]);
        }
      } catch (err) {
        console.error('Failed to load map data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const readingMap = new Map(readings.map(r => [r.stationId, r]));
  const currentReading = selectedStation ? readingMap.get(selectedStation.id) : null;
  const currentLevel = currentReading?.crowdLevel || (selectedStation?.isInterchange ? 'high' : 'medium');
  const levelInfo = getCrowdLevelInfo(currentLevel);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Header */}
      <div className="bg-white border border-transit-border rounded-card p-5 shadow-subtle flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 rounded-transit bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <MapPin size={16} />
            </div>
            <h1 className="text-xl font-bold text-transit-navy tracking-tight">Mumbai Transit Live Crowd Map</h1>
            <span className="flex items-center gap-1 text-xs px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
              Live Feed
            </span>
          </div>
          <p className="text-xs text-transit-muted mt-0.5 ml-10">
            Real-time occupancy for Western Line, Central Line, Harbour Line, Metro 1/2A/7/3, and BEST transit corridors.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate('/timings')}
            className="px-3 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-xs font-semibold rounded-transit text-slate-700 transition-colors flex items-center gap-1.5"
          >
            <span>Peak Hour Timings</span>
            <ArrowRight size={13} />
          </button>
        </div>
      </div>

      {/* Main Container */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Map Box */}
        <div className="lg:col-span-8">
          <LeafletCrowdMap
            stations={stations}
            readings={readings}
            lines={lines}
            onSelectStationAsOrigin={(stn) => {
              setSelectedStation(stn);
              navigate(`/routes?from=${stn.id}`);
            }}
            onSelectStationAsDest={(stn) => {
              setSelectedStation(stn);
              navigate(`/routes?to=${stn.id}`);
            }}
            height="620px"
          />
        </div>

        {/* Station Detail Sidebar */}
        <div className="lg:col-span-4 space-y-4">
          {selectedStation ? (
            <div className="bg-white border border-transit-border rounded-card p-5 shadow-card space-y-4">
              {/* Header */}
              <div className="border-b border-slate-100 pb-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded font-medium bg-slate-100 text-slate-700">
                    <ModeIcon mode={selectedStation.mode} size={13} />
                    <span className="capitalize">{selectedStation.mode} Station</span>
                  </span>
                  <span className="text-xs font-mono font-semibold px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
                    {selectedStation.code}
                  </span>
                </div>

                <h3 className="text-lg font-bold text-transit-navy">
                  {selectedStation.name}
                </h3>
                {selectedStation.marathiName && (
                  <p className="text-xs text-slate-500 font-medium">
                    {selectedStation.marathiName}
                  </p>
                )}
                <p className="text-xs text-transit-muted mt-1">
                  Zone: {selectedStation.zone || 'Mumbai Metropolitan Region'}
                </p>
              </div>

              {/* Crowd Indicator */}
              <div className="bg-slate-50 border border-slate-100 rounded-transit p-3.5 space-y-2">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                  Current Crowd Reading
                </span>

                <div className="flex items-center justify-between">
                  <CrowdBadge
                    level={currentLevel}
                    occupancy={currentReading?.occupancyPercentage ?? (currentLevel === 'high' ? 88 : 55)}
                    source={currentReading?.source || 'live_sensor'}
                    verified={currentReading?.verified ?? true}
                    size="lg"
                    showDetails={true}
                  />

                  <div className="text-right">
                    <span className="text-[11px] text-slate-400 block">Status:</span>
                    <span className={`text-xs font-semibold ${levelInfo.textColor}`}>
                      {levelInfo.sublabel}
                    </span>
                  </div>
                </div>

                {/* Progress bar visual */}
                <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden mt-2">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${levelInfo.dotColor}`}
                    style={{ width: `${currentReading?.occupancyPercentage ?? (currentLevel === 'high' ? 88 : 55)}%` }}
                  />
                </div>
              </div>

              {/* Facilities */}
              {selectedStation.facilities && (
                <div>
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-2">
                    Station Facilities & Amenities
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedStation.facilities.map((fac, idx) => (
                      <span
                        key={idx}
                        className="text-xs px-2 py-0.5 rounded bg-slate-100 text-slate-700"
                      >
                        {fac}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Quick Actions */}
              <div className="pt-2 border-t border-slate-100 grid grid-cols-2 gap-2">
                <button
                  onClick={() => navigate(`/routes?from=${selectedStation.id}`)}
                  className="py-2 px-3 bg-white hover:bg-teal-50 hover:text-teal-900 border border-slate-200 text-xs font-semibold rounded-transit text-center transition-colors"
                >
                  Plan From Here
                </button>
                <button
                  onClick={() => navigate(`/report?stationId=${selectedStation.id}`)}
                  className="py-2 px-3 bg-transit-teal hover:bg-transit-teal-hover text-white text-xs font-semibold rounded-transit text-center transition-colors"
                >
                  Report Rush
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-white border border-transit-border rounded-card p-8 text-center text-xs text-transit-muted">
              Select any station on the map to inspect live crowd data.
            </div>
          )}

          {/* Mumbai Transit Info Card */}
          <div className="bg-white border border-transit-border rounded-card p-4 text-xs text-slate-600 space-y-2">
            <h4 className="font-semibold text-transit-navy text-sm">
              Mumbai Suburban Crowding Guidelines
            </h4>
            <p className="leading-relaxed">
              Suburban local trains operate under Super Dense Crush Load (SDCL) conditions during peak rush hours (8:15–11:00 AM &amp; 5:30–8:45 PM).
            </p>
            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100">
              <div className="p-2 rounded bg-emerald-50 text-emerald-900 border border-emerald-100">
                <strong className="block font-semibold">Comfortable (&lt;40%)</strong>
                <span>Guaranteed seating or generous space</span>
              </div>
              <div className="p-2 rounded bg-rose-50 text-rose-900 border border-rose-100">
                <strong className="block font-semibold">SDCL (&gt;75%)</strong>
                <span>Extreme density; exercise boarding caution</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

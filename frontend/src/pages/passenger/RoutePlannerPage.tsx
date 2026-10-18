import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowUpDown,
  Search,
  Train,
  Compass,
  Bus,
  Layers,
  SlidersHorizontal,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  Check,
  ArrowRight,
  MapPin,
  Bookmark,
  Star
} from 'lucide-react';
import { Station, TransitLine, RouteOption, CrowdReading, TransportMode } from '../../types';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { StationSearchInput } from '../../components/StationSearchInput';
import { RouteCard } from '../../components/RouteCard';
import { LeafletCrowdMap } from '../../components/LeafletCrowdMap';
import { TransitSearchLoading } from '../../components/TransitSearchLoading';
import { TransitCorridorGuide } from '../../components/TransitCorridorGuide';

/* ─── Mode Panel Config ────────────────────────────────────────── */
interface ModeSection {
  mode: TransportMode;
  label: string;
  sublabel: string;
  icon: React.ReactNode;
  color: string;          // tailwind ring / border / bg colour prefix
  accent: string;         // hex for inline styles
  bgClass: string;
  borderClass: string;
  textClass: string;
  badgeClass: string;
}

const MODE_SECTIONS: ModeSection[] = [
  {
    mode: 'train',
    label: 'Local Train',
    sublabel: 'Western · Central · Harbour Lines',
    icon: <Train size={18} />,
    color: 'teal',
    accent: '#0f766e',
    bgClass: 'bg-teal-50',
    borderClass: 'border-teal-200',
    textClass: 'text-teal-800',
    badgeClass: 'bg-teal-700 text-white'
  },
  {
    mode: 'metro',
    label: 'Metro',
    sublabel: 'Mumbai Metro M1 · M2A · M3 · M7',
    icon: <Compass size={18} />,
    color: 'sky',
    accent: '#0284c7',
    bgClass: 'bg-sky-50',
    borderClass: 'border-sky-200',
    textClass: 'text-sky-800',
    badgeClass: 'bg-sky-700 text-white'
  },
  {
    mode: 'bus',
    label: 'BEST Buses',
    sublabel: 'Brihanmumbai Electric Supply & Transport',
    icon: <Bus size={18} />,
    color: 'amber',
    accent: '#d97706',
    bgClass: 'bg-amber-50',
    borderClass: 'border-amber-200',
    textClass: 'text-amber-800',
    badgeClass: 'bg-amber-600 text-white'
  }
];

/* ─── Component ──────────────────────────────────────────────────── */
export const RoutePlannerPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const { user, refreshProfile } = useAuth();

  /* data */
  const [stations, setStations] = useState<Station[]>([]);
  const [readings, setReadings] = useState<CrowdReading[]>([]);
  const [lines, setLines] = useState<TransitLine[]>([]);

  /* selection */
  const [fromStation, setFromStation] = useState<Station | null>(null);
  const [toStation, setToStation] = useState<Station | null>(null);
  const [selectedModes, setSelectedModes] = useState<TransportMode[]>(['train', 'metro', 'bus']);
  const [showFilters, setShowFilters] = useState(false);
  const [showCorridorGuide, setShowCorridorGuide] = useState(false);

  /* results */
  const [routes, setRoutes] = useState<RouteOption[]>([]);
  const [selectedRouteForMap, setSelectedRouteForMap] = useState<RouteOption | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);
  const [mapHighlight, setMapHighlight] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  /* refs */
  const mapRef = useRef<HTMLDivElement>(null);

  /* ── Initial data load ───────────────────────── */
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [stnRes, readRes, lineRes] = await Promise.all([
          api.getStations(),
          api.getCrowdReadings(),
          api.getLines()
        ]);
        setStations(stnRes.stations);
        setReadings(readRes.readings);
        setLines(lineRes.lines);

        const qFrom = searchParams.get('from');
        const qTo = searchParams.get('to');
        let initialFrom = qFrom ? stnRes.stations.find((s) => s.id === qFrom) : null;
        let initialTo = qTo ? stnRes.stations.find((s) => s.id === qTo) : null;

        if (!initialFrom && !initialTo) {
          initialFrom = stnRes.stations.find((s) => s.name.toLowerCase().includes('borivali')) || null;
          initialTo = stnRes.stations.find((s) => s.name.toLowerCase().includes('churchgate')) || null;
        }

        if (initialFrom) setFromStation(initialFrom);
        if (initialTo) setToStation(initialTo);

        if (initialFrom && initialTo) {
          calculateRoutes(initialFrom.id, initialTo.id, ['train', 'metro', 'bus']);
        }
      } catch {
        setError('Failed to load Mumbai transit data. Please try again.');
      }
    };
    fetchData();
  }, [searchParams]);

  /* ── Route Calculation ───────────────────────── */
  const calculateRoutes = async (fromId: string, toId: string, modes: TransportMode[]) => {
    if (fromId === toId) {
      setError('Origin and destination stations cannot be the same.');
      return;
    }
    setError(null);
    setLoading(true);
    setHasSearched(true);
    try {
      const res = await api.planRoute(fromId, toId, modes);
      setRoutes(res.routes);
      if (res.routes.length > 0) setSelectedRouteForMap(res.routes[0]);
      else setSelectedRouteForMap(null);
    } catch (err: any) {
      setError(err.message || 'Unable to calculate routes.');
      setRoutes([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fromStation || !toStation) {
      setError('Please select both origin and destination stations.');
      return;
    }
    calculateRoutes(fromStation.id, toStation.id, selectedModes);
  };

  const handleSwap = () => {
    const temp = fromStation;
    setFromStation(toStation);
    setToStation(temp);
    if (toStation && temp) calculateRoutes(toStation.id, temp.id, selectedModes);
  };

  const toggleMode = (mode: TransportMode) => {
    let next: TransportMode[];
    if (selectedModes.includes(mode)) {
      if (selectedModes.length === 1) return;
      next = selectedModes.filter((m) => m !== mode);
    } else {
      next = [...selectedModes, mode];
    }
    setSelectedModes(next);
    if (fromStation && toStation) calculateRoutes(fromStation.id, toStation.id, next);
  };

  /* ── Save Route ──────────────────────────────── */
  const handleSaveRoute = async (route: RouteOption) => {
    if (!user) {
      setError('Please sign in to bookmark and save commutes.');
      return;
    }
    try {
      await api.saveRoute({
        fromStationId: fromStation!.id,
        fromStationName: fromStation!.name,
        toStationId: toStation!.id,
        toStationName: toStation!.name,
        preferredMode: route.modes[0]
      });
      await refreshProfile();
      setSaveSuccess(`✓ Saved "${fromStation?.name} → ${toStation?.name}" to your profile!`);
      setTimeout(() => setSaveSuccess(null), 4000);
    } catch (err: any) {
      setError(err.message || 'Failed to save route.');
    }
  };

  /* ── Preview on Map ─────────────────────────── */
  const handlePreviewOnMap = (route: RouteOption) => {
    setSelectedRouteForMap(route);
    // Scroll map into view
    if (mapRef.current) {
      mapRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    // Ring pulse on map
    setMapHighlight(true);
    setTimeout(() => setMapHighlight(false), 1600);
  };

  const isCurrentRouteSaved = user?.savedRoutes?.some(
    (r) => r.fromStationId === fromStation?.id && r.toStationId === toStation?.id
  );

  /* ── Per-mode filtered routes ────────────────── */
  const routesByMode = (mode: TransportMode) =>
    routes.filter((r) => r.modes.includes(mode));

  /* ── Render ──────────────────────────────────── */
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 space-y-5">

      {/* Page Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-1">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-transit-navy tracking-tight">
            Mumbai Route Planner
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Crowd-aware routes across Local Trains, Metro &amp; BEST Buses — powered by live telemetry.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all duration-150 ${
            showFilters || selectedModes.length < 3
              ? 'bg-teal-50 border-teal-200 text-teal-800 shadow-2xs font-semibold'
              : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50 shadow-2xs'
          }`}
        >
          <SlidersHorizontal size={13} className="text-transit-teal" />
          <span>Mode Filters</span>
          {selectedModes.length < 3 && (
            <span className="w-4 h-4 rounded-full bg-transit-teal text-white text-[10px] flex items-center justify-center font-mono">
              {selectedModes.length}
            </span>
          )}
          {showFilters ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
        </button>
      </div>

      {/* Expandable Filters Drawer */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.18, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="bg-white border border-slate-200/90 rounded-xl p-3.5 shadow-2xs flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-semibold text-slate-700">Include:</span>
                {MODE_SECTIONS.map(({ mode, label, icon, badgeClass, bgClass, borderClass, textClass }) => (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => toggleMode(mode)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium border transition-colors ${
                      selectedModes.includes(mode)
                        ? `${badgeClass} border-transparent`
                        : `bg-slate-100 text-slate-600 hover:bg-slate-200 border-transparent`
                    }`}
                  >
                    {icon}
                    <span>{label}</span>
                  </button>
                ))}
              </div>
              <button
                type="button"
                onClick={() => {
                  setSelectedModes(['train', 'metro', 'bus']);
                  if (fromStation && toStation) calculateRoutes(fromStation.id, toStation.id, ['train', 'metro', 'bus']);
                }}
                className="text-xs text-transit-teal hover:underline font-medium"
              >
                Reset All
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Success Banner */}
      <AnimatePresence>
        {saveSuccess && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs p-3 rounded-xl flex items-center gap-2"
          >
            <Check size={15} className="text-emerald-600 shrink-0" />
            <span>{saveSuccess}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main 2-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

        {/* ── LEFT: Search + Route Results ── */}
        <div className="lg:col-span-6 space-y-4">

          {/* Search Card */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 shadow-2xs space-y-3.5">
            <form onSubmit={handleSearchSubmit} className="space-y-3">
              <div className="space-y-2 relative">
                <StationSearchInput
                  label="From Station"
                  placeholder="Starting station (e.g. Borivali)"
                  selectedStationId={fromStation?.id}
                  stations={stations}
                  onSelectStation={(stn) => setFromStation(stn)}
                />

                <div className="flex justify-center -my-1 relative z-10">
                  <button
                    type="button"
                    onClick={handleSwap}
                    className="w-7 h-7 rounded-full bg-white hover:bg-teal-50 border border-slate-200 hover:border-teal-300 text-slate-500 hover:text-transit-teal shadow-2xs flex items-center justify-center transition-all active:scale-90 duration-150"
                    title="Swap origin and destination"
                  >
                    <ArrowUpDown size={12} />
                  </button>
                </div>

                <StationSearchInput
                  label="To Station"
                  placeholder="Destination station (e.g. Churchgate)"
                  selectedStationId={toStation?.id}
                  stations={stations}
                  onSelectStation={(stn) => setToStation(stn)}
                />
              </div>

              {error && (
                <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
                  <AlertCircle size={14} className="shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={loading || !fromStation || !toStation}
                className="w-full h-10 bg-transit-teal hover:bg-transit-teal-hover active:scale-[0.99] text-white text-xs sm:text-sm font-semibold rounded-xl flex items-center justify-center gap-2 transition-all disabled:opacity-50 shadow-xs hover:shadow-sm"
              >
                <Search size={15} />
                <span>Find Optimal Routes</span>
              </button>
            </form>

            {/* Popular Presets */}
            <div className="pt-2 border-t border-slate-100 flex items-center gap-1.5 overflow-x-auto no-scrollbar text-xs">
              <span className="text-slate-400 font-medium text-[11px] shrink-0">Popular:</span>
              {[
                { from: 'stn-borivali', to: 'stn-churchgate', label: 'Borivali ⇄ Churchgate' },
                { from: 'stn-thane', to: 'stn-csmt', label: 'Thane ⇄ CSMT' },
                { from: 'stn-andheri', to: 'stn-bkc-m3', label: 'Andheri ⇄ BKC' },
                { from: 'stn-kurla', to: 'stn-lower-parel', label: 'Kurla ⇄ Lower Parel' }
              ].map((preset, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    const f = stations.find((s) => s.id === preset.from);
                    const t = stations.find((s) => s.id === preset.to);
                    if (f && t) {
                      setFromStation(f);
                      setToStation(t);
                      calculateRoutes(f.id, t.id, selectedModes);
                    }
                  }}
                  className="px-2.5 py-1 bg-slate-50 hover:bg-teal-50/70 hover:border-teal-200 hover:text-transit-teal border border-slate-200/80 rounded-lg text-slate-600 text-[11px] font-medium transition-all shrink-0"
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          {/* ── Results Area ── */}
          <div className="space-y-4">
            {/* RailRadar Banner */}
            <div className="p-2.5 sm:p-3 bg-gradient-to-r from-teal-50 via-emerald-50/60 to-white border border-teal-200/80 rounded-xl flex items-center justify-between text-xs shadow-2xs">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping shrink-0" />
                <span className="font-bold text-slate-800">RailRadar GPS Telemetry Active</span>
                <span className="text-slate-500 hidden sm:inline">&bull; Track live train positions &amp; delays</span>
              </div>
              <Link
                to="/railradar"
                className="text-transit-teal font-bold hover:underline flex items-center gap-1 shrink-0 text-[11px] sm:text-xs bg-white px-2.5 py-1 rounded-lg border border-teal-200"
              >
                <span>Live Radar</span>
                <ArrowRight size={12} />
              </Link>
            </div>

            {/* Loading */}
            {loading && (
              <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-2xs">
                <TransitSearchLoading label="Evaluating suburban schedules, metro interchanges & platform crowd levels..." />
              </div>
            )}

            {/* No results */}
            {!loading && hasSearched && routes.length === 0 && (
              <div className="bg-white border border-dashed border-slate-200 rounded-2xl p-8 text-center text-sm text-slate-500">
                <Train size={30} className="mx-auto mb-2 text-slate-300" />
                <p className="font-semibold text-slate-700">No transit routes found</p>
                <p className="text-xs text-slate-400 mt-1">
                  Try selecting alternative stations or reset mode filters.
                </p>
              </div>
            )}

            {/* ── THREE MODE PANELS ── */}
            {!loading && routes.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between px-1">
                  <span className="text-sm font-bold text-transit-navy">
                    {fromStation?.name} → {toStation?.name}
                  </span>
                  <span className="text-[11px] text-slate-400 bg-slate-50 border border-slate-200 px-2 py-0.5 rounded-md">
                    {routes.length} route{routes.length !== 1 ? 's' : ''} found
                  </span>
                </div>

                {MODE_SECTIONS.filter((ms) => selectedModes.includes(ms.mode)).map((ms) => {
                  const modeRoutes = routesByMode(ms.mode);
                  return (
                    <motion.div
                      key={ms.mode}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.22 }}
                      className={`rounded-2xl border ${ms.borderClass} overflow-hidden shadow-2xs`}
                    >
                      {/* Mode Panel Header */}
                      <div className={`${ms.bgClass} px-4 py-3 flex items-center justify-between border-b ${ms.borderClass}`}>
                        <div className="flex items-center gap-2.5">
                          <span className={`${ms.badgeClass} p-1.5 rounded-lg`}>{ms.icon}</span>
                          <div>
                            <h3 className={`font-bold text-sm ${ms.textClass}`}>{ms.label}</h3>
                            <p className="text-[11px] text-slate-500">{ms.sublabel}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {modeRoutes.length > 0 ? (
                            <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${ms.badgeClass}`}>
                              {modeRoutes.length} option{modeRoutes.length !== 1 ? 's' : ''}
                            </span>
                          ) : (
                            <span className="text-[11px] text-slate-400 bg-slate-100 px-2.5 py-1 rounded-full font-medium">
                              Not available
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Mode Panel Body */}
                      <div className="bg-white divide-y divide-slate-100">
                        {modeRoutes.length === 0 ? (
                          <div className="px-4 py-5 text-center text-xs text-slate-400 flex flex-col items-center gap-1.5">
                            <span className="text-2xl opacity-40">{ms.mode === 'train' ? '🚂' : ms.mode === 'metro' ? '🚇' : '🚌'}</span>
                            <p className="text-slate-500 font-medium">
                              No direct {ms.label} route for this journey
                            </p>
                            <p className="text-[11px]">
                              {ms.mode === 'train'
                                ? 'Try nearby stations or check other modes'
                                : ms.mode === 'metro'
                                ? 'Metro network may not cover this corridor directly'
                                : 'Check BEST bus stop near origin or destination'}
                            </p>
                          </div>
                        ) : (
                          modeRoutes.map((route, idx) => (
                            <div
                              key={route.id}
                              className={`relative transition-all ${
                                selectedRouteForMap?.id === route.id
                                  ? 'ring-2 ring-inset ring-transit-teal'
                                  : ''
                              }`}
                            >
                              {idx === 0 && modeRoutes.length > 0 && (
                                <div className="absolute top-3 right-3 z-10">
                                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${ms.badgeClass} flex items-center gap-1`}>
                                    <Star size={9} className="fill-current" />
                                    Best {ms.label}
                                  </span>
                                </div>
                              )}
                              <div className="px-3 pt-3 pb-1">
                                <RouteCard
                                  route={route}
                                  onSaveRoute={handleSaveRoute}
                                  onSelectOnMap={handlePreviewOnMap}
                                  isSaved={isCurrentRouteSaved}
                                />
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </motion.div>
                  );
                })}

                {/* Corridor Guide */}
                {fromStation && toStation && (
                  <div className="pt-1">
                    <button
                      type="button"
                      onClick={() => setShowCorridorGuide(!showCorridorGuide)}
                      className="w-full p-3 rounded-xl border border-teal-200/80 bg-teal-50/50 hover:bg-teal-50 text-teal-900 text-xs font-medium flex items-center justify-between transition-colors shadow-2xs"
                    >
                      <span className="flex items-center gap-2">
                        <Compass size={15} className="text-transit-teal" />
                        <span>Corridor Transit Guide (Metro Interchanges &amp; Feeder Buses)</span>
                      </span>
                      <span className="text-[11px] text-transit-teal font-semibold">
                        {showCorridorGuide ? 'Hide Guide' : 'View Guide'}
                      </span>
                    </button>
                    {showCorridorGuide && (
                      <div className="mt-2.5">
                        <TransitCorridorGuide
                          fromStation={fromStation}
                          toStation={toStation}
                          routes={routes}
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* ── RIGHT: Live Map Preview ── */}
        <div className="lg:col-span-6 sticky top-20 space-y-2.5">
          <div className="flex items-center justify-between text-xs text-slate-500 px-1">
            <span className="font-semibold text-slate-800 flex items-center gap-1.5">
              <Layers size={14} className="text-transit-teal" />
              Live Route Network
            </span>
            <div className="flex items-center gap-2">
              {selectedRouteForMap && (
                <span className="text-teal-800 bg-teal-50 px-2 py-0.5 rounded-md border border-teal-200 text-[11px] font-medium flex items-center gap-1">
                  <MapPin size={10} className="text-transit-teal" />
                  {selectedRouteForMap.title}
                </span>
              )}
            </div>
          </div>

          {/* Selected route quick summary */}
          {selectedRouteForMap && (
            <motion.div
              key={selectedRouteForMap.id}
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white border border-slate-200/90 rounded-xl px-3.5 py-2.5 text-xs flex flex-wrap items-center justify-between gap-2 shadow-2xs"
            >
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-semibold text-slate-800 flex items-center gap-1">
                  <MapPin size={11} className="text-transit-teal" />
                  Previewing on Map:
                </span>
                <span className="text-transit-navy font-bold">{selectedRouteForMap.title}</span>
                <span className="text-slate-400">·</span>
                <span className="text-slate-600">~{selectedRouteForMap.totalDurationMins} mins</span>
                <span className="text-slate-400">·</span>
                <span className="text-slate-600">₹{selectedRouteForMap.estimatedFareRupees}</span>
              </div>
              <div className="flex items-center gap-1.5">
                {user ? (
                  <button
                    onClick={() => handleSaveRoute(selectedRouteForMap)}
                    className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border transition-colors text-[11px] font-medium ${
                      isCurrentRouteSaved
                        ? 'bg-amber-50 text-amber-800 border-amber-300'
                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <Bookmark size={11} className={isCurrentRouteSaved ? 'fill-amber-600' : ''} />
                    <span>{isCurrentRouteSaved ? 'Saved' : 'Save Route'}</span>
                  </button>
                ) : (
                  <Link
                    to="/signin"
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 text-[11px] text-slate-600 hover:bg-slate-50 font-medium"
                  >
                    Sign in to save
                  </Link>
                )}
              </div>
            </motion.div>
          )}

          {/* Map Container */}
          <div
            ref={mapRef}
            className={`rounded-2xl overflow-hidden border shadow-2xs bg-white transition-all duration-300 ${
              mapHighlight
                ? 'border-transit-teal ring-4 ring-transit-teal/30 shadow-lg'
                : 'border-slate-200/90'
            }`}
          >
            <LeafletCrowdMap
              stations={stations}
              readings={readings}
              lines={lines}
              selectedRoute={selectedRouteForMap}
              onSelectStationAsOrigin={(stn) => setFromStation(stn)}
              onSelectStationAsDest={(stn) => setToStation(stn)}
              height="580px"
            />
          </div>

          {/* Map hint */}
          <p className="text-[11px] text-slate-400 text-center px-1">
            Click any station on the map to set it as origin or destination. Click "Preview on Map" on a route card to highlight it.
          </p>
        </div>

      </div>
    </div>
  );
};

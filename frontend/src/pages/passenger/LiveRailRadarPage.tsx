import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Train,
  Radio,
  Search,
  Clock,
  MapPin,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  RefreshCw,
  Compass,
  AlertTriangle,
  Layers,
  ChevronRight,
  CheckCircle2,
  ExternalLink,
  X
} from 'lucide-react';
import { api } from '../../services/api';
import { RailRadarTrainSearch, RailRadarLiveStatus } from '../../types';
import { LiveRailRadarModal } from '../../components/LiveRailRadarModal';

export const LiveRailRadarPage: React.FC = () => {
  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<RailRadarTrainSearch[]>([]);
  const [searching, setSearching] = useState(false);
  const [searchDropdownOpen, setSearchDropdownOpen] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  // Close search dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setSearchDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Popular / Featured trains
  const [popularTrains, setPopularTrains] = useState<any[]>([]);
  const [loadingPopular, setLoadingPopular] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'western' | 'central' | 'express'>('all');

  // Station between state
  const [betweenFrom, setBetweenFrom] = useState('MMCT');
  const [betweenTo, setBetweenTo] = useState('BVI');
  const [betweenTrains, setBetweenTrains] = useState<any[]>([]);
  const [loadingBetween, setLoadingBetween] = useState(false);

  // Modal inspection
  const [inspectTrainNumber, setInspectTrainNumber] = useState<string | null>(null);

  // API Status
  const [apiStatus, setApiStatus] = useState<any>(null);

  // Load initial popular trains and status
  useEffect(() => {
    const initData = async () => {
      setLoadingPopular(true);
      try {
        const [popRes, statusRes] = await Promise.all([
          api.getPopularMumbaiTrains(),
          api.getRailRadarStatus()
        ]);
        if (popRes && popRes.trains) {
          setPopularTrains(popRes.trains);
        }
        if (statusRes && statusRes.status) {
          setApiStatus(statusRes.status);
        }
      } catch (err) {
        console.warn('Failed to load initial RailRadar data:', err);
      } finally {
        setLoadingPopular(false);
      }
    };

    initData();
  }, []);

  // Handle train search debounce
  useEffect(() => {
    if (!searchQuery.trim() || searchQuery.trim().length < 2) {
      setSearchResults([]);
      setSearchDropdownOpen(false);
      return;
    }

    const timer = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await api.searchTrains(searchQuery);
        if (res && res.trains) {
          setSearchResults(res.trains);
          setSearchDropdownOpen(true);
        }
      } catch (err) {
        console.warn('Search failed:', err);
      } finally {
        setSearching(false);
      }
    }, 280);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Handle direct train search / Enter key / Track button
  const handleDirectSearch = (overrideQuery?: string) => {
    const q = (overrideQuery || searchQuery).trim();
    if (!q) return;

    if (searchResults.length > 0) {
      const exact = searchResults.find(
        (t) =>
          t.number.toLowerCase() === q.toLowerCase() ||
          t.name.toLowerCase().includes(q.toLowerCase())
      );
      if (exact) {
        setInspectTrainNumber(exact.number);
        setSearchDropdownOpen(false);
        return;
      }
      setInspectTrainNumber(searchResults[0].number);
      setSearchDropdownOpen(false);
      return;
    }

    const numMatch = q.match(/\d{2,6}/);
    const trainNum = numMatch ? numMatch[0] : q;
    setInspectTrainNumber(trainNum);
    setSearchDropdownOpen(false);
  };

  // Handle Between Station Query
  const handleQueryBetween = async () => {
    if (!betweenFrom || !betweenTo) return;
    setLoadingBetween(true);
    try {
      const res = await api.getTrainsBetween(betweenFrom, betweenTo);
      if (res && res.trains) {
        setBetweenTrains(res.trains);
      }
    } catch (err) {
      console.warn('Between query failed:', err);
    } finally {
      setLoadingBetween(false);
    }
  };

  useEffect(() => {
    handleQueryBetween();
  }, [betweenFrom, betweenTo]);

  // Filtered popular trains
  const filteredPopular = popularTrains.filter((t) => {
    if (selectedCategory === 'all') return true;
    if (selectedCategory === 'western') return t.corridor?.toLowerCase().includes('western');
    if (selectedCategory === 'central') return t.corridor?.toLowerCase().includes('central');
    if (selectedCategory === 'express') {
      return (
        t.type?.toLowerCase().includes('rajdhani') ||
        t.type?.toLowerCase().includes('vande bharat') ||
        t.type?.toLowerCase().includes('superfast')
      );
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-slate-50/70 pb-16">
      {/* Top Hero Section */}
      <div className="bg-gradient-to-b from-transit-navy via-slate-900 to-slate-900 text-white pt-10 pb-16 px-4 sm:px-6 lg:px-8 border-b border-white/10 relative z-30">
        {/* Subtle background radar circles confined to their own layer */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute right-0 top-0 translate-x-1/3 -translate-y-1/3 w-96 h-96 rounded-full border border-teal-500/10" />
          <div className="absolute right-0 top-0 translate-x-1/3 -translate-y-1/3 w-72 h-72 rounded-full border border-teal-500/15" />
          <div className="absolute right-0 top-0 translate-x-1/3 -translate-y-1/3 w-48 h-48 rounded-full border border-teal-500/20" />
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/30 text-transit-teal text-xs font-semibold mb-3">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <span>RailRadar Telemetry API Integrated</span>
                <span className="text-white/40">&bull;</span>
                <span className="font-mono text-[10px] text-teal-300">Live GPS Feeds</span>
              </div>
              <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white">
                Live Mumbai Train Radar
              </h1>
              <p className="mt-2 text-sm sm:text-base text-slate-300 max-w-2xl">
                Real-time tracking of Mumbai Suburban locals, Vande Bharat, and Intercity Express
                trains. Live running delays, platform numbers, and coach composition.
              </p>
            </div>

            {/* API Health Pill */}
            {apiStatus && (
              <div className="bg-white/5 border border-white/10 backdrop-blur-md p-3.5 rounded-2xl flex items-center gap-3.5 shadow-xl shrink-0">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                  <Radio size={20} className="animate-pulse" />
                </div>
                <div className="text-xs">
                  <div className="flex items-center gap-1.5 font-bold text-white">
                    <span>RailRadar Feed Active</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5 font-mono">
                    Key: {apiStatus.apiKeyMasked || 'rg_d2e8...'} &bull; Cached
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Search Box */}
          <div ref={searchContainerRef} className="mt-8 max-w-2xl relative z-40">
            <div className="relative">
              <Search
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  if (e.target.value.trim().length >= 2) {
                    setSearchDropdownOpen(true);
                  }
                }}
                onFocus={() => {
                  if (searchQuery.trim().length >= 2) setSearchDropdownOpen(true);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleDirectSearch();
                  }
                }}
                placeholder="Search train by number or name (e.g. 04101, 12951, Rajdhani, Borivali Local)..."
                className="w-full pl-11 pr-36 py-3.5 rounded-2xl bg-white/10 border border-white/20 text-white placeholder-slate-400 text-sm focus:outline-hidden focus:ring-2 focus:ring-transit-teal focus:bg-white/15 transition-all shadow-inner"
              />
              <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-2">
                {searching && (
                  <RefreshCw size={15} className="text-transit-teal animate-spin" />
                )}
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery('');
                      setSearchResults([]);
                      setSearchDropdownOpen(false);
                    }}
                    className="p-1 rounded-full text-slate-400 hover:text-white hover:bg-white/20 transition-colors"
                    title="Clear search"
                  >
                    <X size={15} />
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => handleDirectSearch()}
                  disabled={!searchQuery.trim()}
                  className="px-3 py-1.5 rounded-xl bg-transit-teal hover:bg-teal-400 text-slate-900 font-bold text-xs flex items-center gap-1.5 transition-all shadow-md active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                  title="Track Live Telemetry"
                >
                  <span>Track</span>
                  <ArrowRight size={13} />
                </button>
              </div>
            </div>

            {/* Search Autocomplete Dropdown */}
            <AnimatePresence>
              {searchDropdownOpen && searchQuery.trim().length >= 2 && (
                <motion.div
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 5 }}
                  className="absolute left-0 right-0 top-full mt-2 bg-white rounded-2xl shadow-2xl border border-slate-200/90 text-slate-800 z-50 overflow-hidden max-h-88 overflow-y-auto ring-1 ring-black/10"
                >
                  {searchResults.length > 0 ? (
                    <>
                      <div className="p-2.5 text-[11px] font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-100 bg-slate-50 px-3 flex items-center justify-between">
                        <span>Matching Trains ({searchResults.length})</span>
                        <span className="text-[10px] text-slate-400 font-normal">Click or press Enter to track</span>
                      </div>
                      {searchResults.map((train) => (
                        <button
                          key={train.number}
                          type="button"
                          onClick={() => {
                            setInspectTrainNumber(train.number);
                            setSearchDropdownOpen(false);
                          }}
                          className="w-full text-left p-3.5 hover:bg-teal-50/80 border-b border-slate-100 last:border-b-0 flex items-center justify-between transition-colors group cursor-pointer"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-teal-100/70 text-transit-teal flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                              <Train size={18} />
                            </div>
                            <div>
                              <div className="font-bold text-sm text-slate-900 group-hover:text-transit-teal flex items-center gap-2">
                                <span className="font-mono text-xs px-1.5 py-0.5 rounded bg-slate-100 border border-slate-200 text-slate-700">
                                  #{train.number}
                                </span>
                                <span>{train.name}</span>
                              </div>
                              <div className="text-xs text-slate-500 mt-0.5 flex items-center gap-1.5">
                                <span>{train.sourceName || train.source} &rarr; {train.destName || train.dest}</span>
                                {train.type && (
                                  <span className="font-mono text-[10px] bg-slate-100 px-1.5 py-0.5 rounded text-slate-600">
                                    {train.type}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          <span className="text-xs font-semibold text-transit-teal flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                            <span>Live Telemetry</span>
                            <ChevronRight size={14} />
                          </span>
                        </button>
                      ))}
                    </>
                  ) : (
                    <div className="p-5 text-center">
                      <div className="w-10 h-10 rounded-full bg-teal-50 text-transit-teal mx-auto flex items-center justify-center mb-2">
                        <Radio size={20} className="animate-pulse" />
                      </div>
                      <div className="font-bold text-sm text-slate-900">
                        Track Train #{searchQuery.trim()}
                      </div>
                      <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                        Fetch real-time live GPS telemetry, intermediate stops, and running delay forecast.
                      </p>
                      <button
                        type="button"
                        onClick={() => handleDirectSearch()}
                        className="mt-3.5 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-transit-teal hover:bg-teal-400 text-slate-900 font-bold text-xs transition-colors shadow-sm cursor-pointer"
                      >
                        <Radio size={14} />
                        <span>Launch Live Radar Telemetry</span>
                        <ArrowRight size={13} />
                      </button>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Popular Live Trains Grid (2 cols) */}
          <div className="lg:col-span-2 space-y-6">
            {/* Filter Tabs */}
            <div className="bg-white rounded-2xl p-4 shadow-2xs border border-slate-200/80 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-1.5 overflow-x-auto">
                <button
                  type="button"
                  onClick={() => setSelectedCategory('all')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
                    selectedCategory === 'all'
                      ? 'bg-transit-teal text-white shadow-2xs'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  All Popular Trains
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedCategory('western')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
                    selectedCategory === 'western'
                      ? 'bg-transit-teal text-white shadow-2xs'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  Western Line
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedCategory('central')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
                    selectedCategory === 'central'
                      ? 'bg-transit-teal text-white shadow-2xs'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  Central Line
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedCategory('express')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
                    selectedCategory === 'express'
                      ? 'bg-transit-teal text-white shadow-2xs'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  Vande Bharat & Rajdhani
                </button>
              </div>

              <div className="text-xs text-slate-400 font-mono flex items-center gap-1.5">
                <Radio size={13} className="text-emerald-500 animate-pulse" />
                <span>Live GPS Feed</span>
              </div>
            </div>

            {/* Popular Trains Cards */}
            {loadingPopular ? (
              <div className="bg-white rounded-2xl p-12 text-center shadow-2xs border border-slate-200">
                <RefreshCw size={28} className="text-transit-teal animate-spin mx-auto mb-3" />
                <p className="text-sm font-semibold text-slate-700">Connecting to RailRadar telemetry...</p>
                <p className="text-xs text-slate-400 mt-1">Retrieving live positions for Mumbai trains</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredPopular.map((train) => {
                  const isDelayed = (train.delayMinutes ?? 0) > 5;
                  return (
                    <motion.div
                      key={train.trainNumber}
                      whileHover={{ y: -2 }}
                      className="bg-white rounded-2xl p-4 shadow-2xs border border-slate-200 hover:border-teal-300 transition-all flex flex-col justify-between"
                    >
                      <div>
                        {/* Top row */}
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200">
                            #{train.trainNumber}
                          </span>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${
                              isDelayed
                                ? 'bg-amber-100 text-amber-800 border border-amber-200'
                                : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                            }`}
                          >
                            <Clock size={11} />
                            {isDelayed ? `+${train.delayMinutes}m Delayed` : 'Right Time'}
                          </span>
                        </div>

                        {/* Title */}
                        <h3 className="font-bold text-sm text-slate-900 line-clamp-1">
                          {train.trainName}
                        </h3>
                        <p className="text-xs text-slate-500 mt-0.5">
                          {train.corridor} &bull; <span className="font-medium text-slate-600">{train.type}</span>
                        </p>

                        {/* Current Station details */}
                        <div className="mt-3 p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 text-xs">
                          <div className="flex items-center justify-between text-[11px] text-slate-500">
                            <span>Current Position</span>
                            <span className="font-semibold text-slate-800">
                              {train.currentLocation?.stationName || 'En Route'}
                            </span>
                          </div>
                          {train.nextHalt && (
                            <div className="flex items-center justify-between text-[11px] text-slate-500 mt-1 pt-1 border-t border-slate-200/60">
                              <span>Next Stop</span>
                              <span className="font-medium text-transit-teal">
                                {train.nextHalt.stationName}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Action */}
                      <button
                        type="button"
                        onClick={() => setInspectTrainNumber(train.trainNumber)}
                        className="mt-4 w-full py-2 px-3 rounded-xl bg-slate-100 hover:bg-transit-teal hover:text-white text-slate-700 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors group"
                      >
                        <Radio size={13} className="text-emerald-500 group-hover:text-white" />
                        <span>View Live GPS Telemetry</span>
                        <ArrowRight size={13} />
                      </button>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Right Column: Station-to-Station Live Finder & API Specs (1 col) */}
          <div className="space-y-6">
            {/* Station Between Card */}
            <div className="bg-white rounded-2xl p-5 shadow-2xs border border-slate-200">
              <div className="flex items-center gap-2 mb-3 text-transit-navy font-bold text-sm">
                <Compass size={17} className="text-transit-teal" />
                <span>Station-to-Station Live Trains</span>
              </div>
              <p className="text-xs text-slate-500 mb-4">
                Query direct Suburban EMUs and Intercity trains connecting Mumbai stations:
              </p>

              <div className="space-y-3">
                <div>
                  <label className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider block mb-1">
                    From Station
                  </label>
                  <select
                    value={betweenFrom}
                    onChange={(e) => setBetweenFrom(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-slate-50 font-medium text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-transit-teal"
                  >
                    <option value="MMCT">MMCT - Mumbai Central</option>
                    <option value="CCG">CCG - Churchgate</option>
                    <option value="CSMT">CSMT - Chhatrapati Shivaji Terminus</option>
                    <option value="DDR">DDR - Dadar</option>
                    <option value="ADH">ADH - Andheri</option>
                    <option value="BVI">BVI - Borivali</option>
                    <option value="TNA">TNA - Thane</option>
                    <option value="KYN">KYN - Kalyan</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider block mb-1">
                    To Station
                  </label>
                  <select
                    value={betweenTo}
                    onChange={(e) => setBetweenTo(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-slate-50 font-medium text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-transit-teal"
                  >
                    <option value="BVI">BVI - Borivali</option>
                    <option value="MMCT">MMCT - Mumbai Central</option>
                    <option value="CCG">CCG - Churchgate</option>
                    <option value="CSMT">CSMT - Mumbai CSMT</option>
                    <option value="ADH">ADH - Andheri</option>
                    <option value="TNA">TNA - Thane</option>
                    <option value="KYN">KYN - Kalyan</option>
                    <option value="PNVL">PNVL - Panvel</option>
                  </select>
                </div>
              </div>

              {/* Trains Between Results */}
              <div className="mt-4 pt-4 border-t border-slate-100">
                <div className="text-[11px] font-semibold text-slate-500 mb-2 flex items-center justify-between">
                  <span>Available Trains</span>
                  <span>{betweenTrains.length} options</span>
                </div>

                {loadingBetween ? (
                  <div className="py-6 text-center text-xs text-slate-400">
                    <RefreshCw size={18} className="animate-spin text-transit-teal mx-auto mb-1" />
                    Fetching trains...
                  </div>
                ) : betweenTrains.length > 0 ? (
                  <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                    {betweenTrains.map((item, idx) => (
                      <div
                        key={idx}
                        onClick={() => setInspectTrainNumber(item.train?.number)}
                        className="p-2.5 bg-slate-50 hover:bg-teal-50/50 rounded-xl border border-slate-200/80 cursor-pointer transition-colors text-xs"
                      >
                        <div className="flex items-center justify-between font-bold text-slate-800">
                          <span className="line-clamp-1">{item.train?.name}</span>
                          <span className="font-mono text-[10px] text-transit-teal">
                            #{item.train?.number}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-[11px] text-slate-500 mt-1">
                          <span>Dep: {item.from?.departureTime || 'Every 5m'}</span>
                          <span>Arr: {item.to?.arrivalTime || '--'}</span>
                          <span className="text-slate-400 font-mono">
                            {item.durationMinutes ? `${item.durationMinutes}m` : 'Direct'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-xs text-slate-400 py-3 text-center">
                    Select origin and destination to view live connections.
                  </div>
                )}
              </div>
            </div>

            {/* RailRadar API Integration Info Card */}
            <div className="bg-gradient-to-br from-slate-900 to-transit-navy text-white rounded-2xl p-5 shadow-xl border border-white/10">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles size={16} className="text-transit-teal" />
                <h4 className="font-bold text-sm">RailRadar Data Source</h4>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Powered by <strong>railradar.in</strong> live telemetry APIs. GoFlow combines Indian
                Railways GPS feeds with crowd density sensors to forecast train delays, platform
                allocations, and coach occupancy.
              </p>

              <div className="mt-4 pt-3 border-t border-white/10 space-y-1.5 text-[11px] text-slate-300">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Endpoint Protocol:</span>
                  <span className="font-mono text-emerald-400">HTTPS Bearer Auth</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Caching Engine:</span>
                  <span className="font-mono text-transit-teal">In-Memory Smart Cache</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Data Coverage:</span>
                  <span>Suburban EMU + IR Network</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Live Train Telemetry Modal */}
      {inspectTrainNumber && (
        <LiveRailRadarModal
          trainNumber={inspectTrainNumber}
          onClose={() => setInspectTrainNumber(null)}
        />
      )}
    </div>
  );
};

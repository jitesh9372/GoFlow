import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Train,
  ArrowRight,
  Radio,
  Users,
  Search,
  Zap,
  MapPin,
  Clock,
  ShieldCheck,
  Compass,
  Sparkles
} from 'lucide-react';
import { Station, CrowdReading, TransitLine } from '../types';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { StationSearchInput } from '../components/StationSearchInput';
import { LeafletCrowdMap } from '../components/LeafletCrowdMap';
import { TiltCard } from '../components/TiltCard';
import { CountUp } from '../components/CountUp';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { loginAsDemo } = useAuth();

  const [stations, setStations] = useState<Station[]>([]);
  const [readings, setReadings] = useState<CrowdReading[]>([]);
  const [lines, setLines] = useState<TransitLine[]>([]);
  const [fromStation, setFromStation] = useState<Station | null>(null);
  const [toStation, setToStation] = useState<Station | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [stnRes, readRes, lineRes] = await Promise.all([
          api.getStations(),
          api.getCrowdReadings(),
          api.getLines().catch(() => ({ lines: [] }))
        ]);
        setStations(stnRes.stations);
        setReadings(readRes.readings);
        setLines(lineRes.lines);
      } catch (err) {
        console.error('Error loading landing data:', err);
      }
    };
    fetchData();
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (fromStation && toStation) {
      navigate(`/routes?from=${fromStation.id}&to=${toStation.id}`);
    } else {
      navigate('/routes');
    }
  };

  return (
    <div className="space-y-10 pb-16">
      {/* 1. Premium Hero Section */}
      <section className="relative bg-gradient-to-br from-slate-50 via-white to-teal-50/40 border-b border-transit-border py-10 sm:py-14 overflow-hidden">
        {/* Subtle grid pattern overlay */}
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle, #0f766e 1px, transparent 1px)', backgroundSize: '28px 28px' }} />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left Copy & Single Strong CTA */}
            <div className="lg:col-span-7 space-y-5">
              <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-teal-50 border border-teal-200 text-transit-teal text-xs font-semibold">
                <span className="w-2 h-2 rounded-full bg-transit-teal animate-pulse" />
                <span>Mumbai Western • Central • Harbour • Metro Corridors</span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-transit-navy tracking-tight leading-[1.15]">
                Crowd-Aware Transit <br className="hidden sm:inline" />
                <span className="text-transit-teal">Navigation for Mumbai.</span>
              </h1>

              <p className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-xl">
                Compare suburban trains, metro lines, and feeder buses with verified platform crowd metrics, transfer walkways, and crush-load predictions.
              </p>

              {/* Single Clear Guided Search Action */}
              <div className="bg-slate-50 border border-slate-200/80 rounded-card p-4 shadow-subtle max-w-xl">
                <form onSubmit={handleSearchSubmit} className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <StationSearchInput
                      label="From (Origin)"
                      placeholder="e.g. Borivali, Dadar, Thane..."
                      selectedStationId={fromStation?.id}
                      stations={stations}
                      onSelectStation={(stn) => setFromStation(stn)}
                    />
                    <StationSearchInput
                      label="To (Destination)"
                      placeholder="e.g. Churchgate, CSMT, BKC..."
                      selectedStationId={toStation?.id}
                      stations={stations}
                      onSelectStation={(stn) => setToStation(stn)}
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 bg-transit-teal hover:bg-transit-teal-hover active:scale-[0.98] text-white text-xs sm:text-sm font-semibold rounded-transit flex items-center justify-center gap-2 shadow-xs hover:shadow-sm transition-all duration-150"
                  >
                    <Search size={15} />
                    <span>Find Least Crowded Route</span>
                  </button>
                </form>
              </div>

              {/* Frequent Commute Chips */}
              <div className="flex flex-wrap items-center gap-2 text-xs pt-1">
                <span className="text-slate-500 font-medium">Quick Routes:</span>
                {[
                  { label: 'Borivali → Churchgate', from: 'stn-borivali', to: 'stn-churchgate' },
                  { label: 'Thane → CSMT', from: 'stn-thane', to: 'stn-csmt' },
                  { label: 'Andheri → BKC', from: 'stn-andheri', to: 'stn-bkc-m3' }
                ].map((item, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      const f = stations.find((s) => s.id === item.from);
                      const t = stations.find((s) => s.id === item.to);
                      if (f && t) {
                        setFromStation(f);
                        setToStation(t);
                      }
                    }}
                    className="px-2.5 py-1 bg-white hover:bg-slate-100 hover:border-slate-300 active:scale-95 text-slate-700 font-medium rounded-transit border border-slate-200 transition-all duration-150"
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Right: Live Transit Network Metrics Snapshot */}
            <div className="lg:col-span-5 bg-white border border-transit-border rounded-card p-5 shadow-card space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                  <h3 className="font-bold text-sm text-transit-navy">
                    Suburban Network Operations
                  </h3>
                </div>
                <span className="text-[11px] font-mono text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 font-semibold">
                  NORMAL
                </span>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between p-2.5 rounded bg-slate-50/70 border border-slate-100 hover:bg-slate-50 transition-colors">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-teal-600" />
                    <span className="font-semibold text-slate-800">Western Suburban</span>
                  </div>
                  <span className="text-slate-500 font-mono text-[11px]">3 min frequency • Fast/Slow</span>
                </div>

                <div className="flex items-center justify-between p-2.5 rounded bg-slate-50/70 border border-slate-100 hover:bg-slate-50 transition-colors">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-rose-600" />
                    <span className="font-semibold text-slate-800">Central Main Line</span>
                  </div>
                  <span className="text-slate-500 font-mono text-[11px]">4 min frequency • Normal</span>
                </div>

                <div className="flex items-center justify-between p-2.5 rounded bg-slate-50/70 border border-slate-100 hover:bg-slate-50 transition-colors">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-sky-600" />
                    <span className="font-semibold text-slate-800">Mumbai Metro (1 &amp; 3)</span>
                  </div>
                  <span className="text-slate-500 font-mono text-[11px]">AC Underground/Elevated</span>
                </div>

                <div className="flex items-center justify-between p-2.5 rounded bg-slate-50/70 border border-slate-100 hover:bg-slate-50 transition-colors">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-amber-600" />
                    <span className="font-semibold text-slate-800">Harbour &amp; Feeder BEST</span>
                  </div>
                  <span className="text-slate-500 font-mono text-[11px]">BKC / Parel Connectors</span>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                <Link
                  to="/timings"
                  className="text-xs text-transit-teal font-semibold hover:underline flex items-center gap-1"
                >
                  <span>Quiet Commute Hours</span>
                  <ArrowRight size={13} />
                </Link>
                <Link
                  to="/map"
                  className="text-xs text-slate-500 hover:text-slate-800 hover:underline"
                >
                  Interactive Map
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Stats Bar with CountUp Animations */}
      <motion.section
        initial={{ opacity: 0, y: 14 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.3 }}
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
      >
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-white border border-transit-border rounded-card p-5 shadow-subtle text-center divide-y md:divide-y-0 md:divide-x divide-slate-100">
          <div className="p-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-transit-navy tracking-tight block">
              <CountUp end={135} suffix="+" duration={1200} />
            </span>
            <span className="text-xs text-transit-muted font-medium mt-0.5 block">
              Monitored Stations
            </span>
          </div>

          <div className="p-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-transit-navy tracking-tight block">
              <CountUp end={3.4} suffix="M" decimals={1} duration={1200} />
            </span>
            <span className="text-xs text-transit-muted font-medium mt-0.5 block">
              Daily Rail Commuters
            </span>
          </div>

          <div className="p-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-transit-teal tracking-tight block">
              <CountUp end={4} suffix=" Lines" duration={1000} />
            </span>
            <span className="text-xs text-transit-muted font-medium mt-0.5 block">
              Suburban &amp; Metro Corridors
            </span>
          </div>

          <div className="p-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-transit-navy tracking-tight block">
              <CountUp end={99.8} suffix="%" decimals={1} duration={1400} />
            </span>
            <span className="text-xs text-transit-muted font-medium mt-0.5 block">
              Platform Sensor Uptime
            </span>
          </div>
        </div>
      </motion.section>

      {/* 3. Feature Highlights Grid with 3D Tilt Cards */}
      <motion.section
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.35 }}
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6"
      >
        <div className="text-center max-w-2xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold text-transit-navy tracking-tight">
            Built for the Complexity of Mumbai Transit
          </h2>
          <p className="text-xs sm:text-sm text-transit-muted mt-2 leading-relaxed">
            Standard routing apps only count travel time. GoFlow factors in Super Dense Crush Load (SDCL), coach positions, and platform transfer bottlenecks.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Card 1 */}
          <TiltCard maxTilt={6}>
            <div className="bg-white border border-transit-border hover:border-teal-300 rounded-card p-5 shadow-subtle hover:shadow-elevated transition-all duration-200 h-full flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-transit bg-teal-50 text-transit-teal flex items-center justify-center font-bold">
                  <Train size={22} />
                </div>
                <h3 className="font-bold text-base text-transit-navy">
                  Multi-Modal Smart Routing
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Interlinks Western, Central, and Harbour railway lines with Metro Line 1 &amp; underground Line 3, plus vital BEST feeder buses.
                </p>
              </div>
              <Link
                to="/routes"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-transit-teal hover:underline pt-2"
              >
                <span>Plan Commute</span>
                <ArrowRight size={13} />
              </Link>
            </div>
          </TiltCard>

          {/* Card 2: RailRadar Live GPS Telemetry */}
          <TiltCard maxTilt={6}>
            <div className="bg-white border border-transit-border hover:border-emerald-300 rounded-card p-5 shadow-subtle hover:shadow-elevated transition-all duration-200 h-full flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-transit bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold relative">
                  <Radio size={22} className="animate-pulse" />
                  <span className="w-2 h-2 rounded-full bg-emerald-500 absolute top-2 right-2 animate-ping" />
                </div>
                <h3 className="font-bold text-base text-transit-navy">
                  RailRadar Live Telemetry
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Real-time GPS tracking for Mumbai Suburban EMUs and Intercity Express. Live delays, platform numbers, and coach compositions.
                </p>
              </div>
              <Link
                to="/railradar"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600 hover:underline pt-2"
              >
                <span>Open Live Radar</span>
                <ArrowRight size={13} />
              </Link>
            </div>
          </TiltCard>

          {/* Card 3 */}
          <TiltCard maxTilt={6}>
            <div className="bg-white border border-transit-border hover:border-rose-300 rounded-card p-5 shadow-subtle hover:shadow-elevated transition-all duration-200 h-full flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-transit bg-rose-50 text-rose-700 flex items-center justify-center font-bold">
                  <Users size={22} />
                </div>
                <h3 className="font-bold text-base text-transit-navy">
                  Dense Crush Load (SDCL)
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Know density before reaching the platform. Distinct classification between comfortable seating (&lt;40%) and heavy rush (&gt;75%).
                </p>
              </div>
              <Link
                to="/map"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-transit-teal hover:underline pt-2"
              >
                <span>Inspect Density Map</span>
                <ArrowRight size={13} />
              </Link>
            </div>
          </TiltCard>

          {/* Card 4 */}
          <TiltCard maxTilt={6}>
            <div className="bg-white border border-transit-border hover:border-amber-300 rounded-card p-5 shadow-subtle hover:shadow-elevated transition-all duration-200 h-full flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-transit bg-amber-50 text-amber-800 flex items-center justify-center font-bold">
                  <Sparkles size={22} />
                </div>
                <h3 className="font-bold text-base text-transit-navy">
                  Verified Transit Intelligence
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Commuters submit coach rush reports while transit operators verify platform density, ensuring high fidelity crowd intelligence.
                </p>
              </div>
              <Link
                to="/report"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-transit-teal hover:underline pt-2"
              >
                <span>Report Station Rush</span>
                <ArrowRight size={13} />
              </Link>
            </div>
          </TiltCard>
        </div>
      </motion.section>

      {/* 4. Interactive Esri Crowd Map Preview */}
      <motion.section
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.35 }}
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-3"
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-transit-navy flex items-center gap-2">
              <MapPin size={18} className="text-transit-teal" />
              <span>Interactive Mumbai Transit Network Map</span>
            </h2>
            <p className="text-xs text-transit-muted">
              Explore suburban rail and metro stations with Esri World Street and Imagery tiles.
            </p>
          </div>
          <Link
            to="/map"
            className="text-xs font-semibold text-transit-teal hover:underline flex items-center gap-1"
          >
            <span>Open Fullscreen Map</span>
            <ArrowRight size={13} />
          </Link>
        </div>

        <LeafletCrowdMap
          stations={stations}
          readings={readings}
          lines={lines}
          onSelectStationAsOrigin={(stn) => navigate(`/routes?from=${stn.id}`)}
          onSelectStationAsDest={(stn) => navigate(`/routes?to=${stn.id}`)}
          height="460px"
        />
      </motion.section>

      {/* 5. Role Portals Gateway */}
      <motion.section
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.35 }}
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
      >
        <div className="bg-slate-100/80 border border-slate-200 rounded-card p-6 sm:p-8">
          <div className="max-w-xl mx-auto text-center mb-6">
            <h3 className="text-xl font-bold text-transit-navy">
              Dedicated Passenger &amp; Operator Portals
            </h3>
            <p className="text-xs text-transit-muted mt-1.5 leading-relaxed">
              Explore GoFlow either as an everyday Mumbai commuter or as a municipal transit authority managing suburban congestion.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-3xl mx-auto">
            {/* Passenger Gateway */}
            <div className="bg-white border border-transit-border hover:border-teal-300 rounded-card p-5 shadow-subtle flex flex-col justify-between gap-4 transition-all duration-150">
              <div>
                <span className="text-[11px] font-mono uppercase text-transit-teal font-semibold">
                  Commuter View
                </span>
                <h4 className="text-base font-bold text-transit-navy mt-1">
                  Passenger Portal
                </h4>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  Plan multi-modal routes, inspect station crowd levels, save regular commutes, and report platform density.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  loginAsDemo('passenger');
                  navigate('/passenger');
                }}
                className="w-full py-2 bg-slate-100 hover:bg-slate-200 active:scale-[0.98] text-slate-800 text-xs font-semibold rounded-transit flex items-center justify-center gap-1.5 transition-all duration-150"
              >
                <span>Enter as Passenger</span>
                <ArrowRight size={13} />
              </button>
            </div>

            {/* Admin Gateway */}
            <div className="bg-white border border-transit-border hover:border-slate-400 rounded-card p-5 shadow-subtle flex flex-col justify-between gap-4 transition-all duration-150">
              <div>
                <span className="text-[11px] font-mono uppercase text-rose-700 font-semibold">
                  Authority View
                </span>
                <h4 className="text-base font-bold text-transit-navy mt-1">
                  Admin Operations Portal
                </h4>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  Manage transit lines, record sensor updates, moderate commuter reports, and broadcast congestion alerts.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  loginAsDemo('admin');
                  navigate('/admin');
                }}
                className="w-full py-2 bg-transit-navy hover:bg-slate-800 active:scale-[0.98] text-white text-xs font-semibold rounded-transit flex items-center justify-center gap-1.5 transition-all duration-150 shadow-2xs"
              >
                <span>Enter as Transit Admin</span>
                <ArrowRight size={13} />
              </button>
            </div>
          </div>
        </div>
      </motion.section>
    </div>
  );
};

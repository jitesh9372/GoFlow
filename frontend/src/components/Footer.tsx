import React from 'react';
import { Train, Shield, ExternalLink, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-white border-t border-transit-border mt-12 text-xs text-slate-500">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {/* Brand Col */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded bg-transit-teal flex items-center justify-center text-white">
                <Train size={14} />
              </div>
              <span className="font-bold text-sm text-transit-navy">GoFlow Mumbai</span>
            </div>
            <p className="text-[11px] leading-relaxed text-slate-400">
              Crowd-aware urban navigation system modeled on the Mumbai Suburban Railway Network, Mumbai Metro (Lines 1, 2A, 7, 3), and BEST feeder corridors.
            </p>
          </div>

          {/* Lines */}
          <div>
            <span className="font-semibold text-slate-800 uppercase tracking-wider text-[11px] block mb-2">
              Suburban Rail Lines
            </span>
            <ul className="space-y-1.5 text-[11px]">
              <li><Link to="/routes?mode=train" className="hover:text-transit-teal">Western Line (Churchgate – Virar – Dahanu)</Link></li>
              <li><Link to="/routes?mode=train" className="hover:text-transit-teal">Central Main Line (CSMT – Kalyan – Kasara)</Link></li>
              <li><Link to="/routes?mode=train" className="hover:text-transit-teal">Harbour Line (CSMT – Kurla – Panvel)</Link></li>
              <li><Link to="/routes?mode=train" className="hover:text-transit-teal">Trans-Harbour &amp; Uran Feeder Corridors</Link></li>
            </ul>
          </div>

          {/* Metro & Bus */}
          <div>
            <span className="font-semibold text-slate-800 uppercase tracking-wider text-[11px] block mb-2">
              Metro &amp; Municipal Bus
            </span>
            <ul className="space-y-1.5 text-[11px]">
              <li><Link to="/routes?mode=metro" className="hover:text-transit-teal">Metro Line 1 (Versova – Andheri – Ghatkopar)</Link></li>
              <li><Link to="/routes?mode=metro" className="hover:text-transit-teal">Metro Line 2A &amp; 7 (Dahisar – Andheri Link)</Link></li>
              <li><Link to="/routes?mode=metro" className="hover:text-transit-teal">Metro Line 3 (Aqua Line: Aarey – BKC)</Link></li>
              <li><Link to="/routes?mode=bus" className="hover:text-transit-teal">BEST Bus Feeder Services (BKC, SEEPZ, Powai)</Link></li>
            </ul>
          </div>

          {/* Crowd Thresholds & Standards */}
          <div>
            <span className="font-semibold text-slate-800 uppercase tracking-wider text-[11px] block mb-2">
              Crowd Classifications
            </span>
            <div className="space-y-1.5 text-[11px]">
              <div className="flex items-center gap-1.5 text-emerald-700">
                <span className="w-2 h-2 rounded-full bg-emerald-600" />
                <span>&lt;40% Occupancy: Comfortable / Seated</span>
              </div>
              <div className="flex items-center gap-1.5 text-amber-700">
                <span className="w-2 h-2 rounded-full bg-amber-500" />
                <span>40-75% Occupancy: Moderate Standee Load</span>
              </div>
              <div className="flex items-center gap-1.5 text-rose-700">
                <span className="w-2 h-2 rounded-full bg-rose-600" />
                <span>&gt;75% Occupancy: Super Dense Crush (SDCL)</span>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-[11px] text-slate-400">
          <div>
            &copy; {new Date().getFullYear()} GoFlow Mumbai. Built for Mumbai Commuters &amp; Transit Operations.
          </div>
          <div className="flex items-center gap-4">
            <span className="font-mono">OpenStreetMap + CartoDB Positron</span>
            <span className="font-mono">Firebase RBAC Auth</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Zap, Compass } from 'lucide-react';

export const TransitAuthVisual: React.FC = () => {
  return (
    <div className="relative w-full h-full min-h-[480px] lg:min-h-[640px] bg-gradient-to-br from-[#f8fafc] via-[#f0fdfa]/70 to-[#e6f4f1] border-l border-slate-200/80 overflow-hidden flex flex-col justify-between p-8 sm:p-12 text-slate-800 select-none">
      {/* Ambient soft glow & depth gradients matching GoFlow brand */}
      <div className="absolute inset-0 bg-radial-at-t from-teal-500/10 via-transparent to-emerald-500/5 pointer-events-none" />
      <div className="absolute -top-24 -right-24 w-80 h-80 bg-teal-200/35 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-emerald-200/30 rounded-full blur-3xl pointer-events-none" />

      {/* Grid pattern representing transit network corridors */}
      <div
        className="absolute inset-0 opacity-[0.035] pointer-events-none"
        style={{
          backgroundImage:
            'linear-gradient(to right, #0f766e 1px, transparent 1px), linear-gradient(to bottom, #0f766e 1px, transparent 1px)',
          backgroundSize: '36px 36px'
        }}
      />

      {/* Schematic Transit Corridor Lines in background */}
      <svg
        className="absolute inset-0 w-full h-full opacity-20 pointer-events-none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M -50 110 C 100 110, 160 190, 360 190 S 520 120, 700 120"
          fill="none"
          stroke="#0f766e"
          strokeWidth="2.5"
          strokeDasharray="6 6"
        />
        <path
          d="M -50 200 C 120 200, 240 330, 440 330 S 580 250, 700 250"
          fill="none"
          stroke="#0284c7"
          strokeWidth="2"
        />
        <path
          d="M -50 460 C 130 460, 250 370, 460 370 S 600 440, 700 440"
          fill="none"
          stroke="#d97706"
          strokeWidth="2"
          strokeDasharray="4 4"
        />
      </svg>

      {/* Top Branding Pill Header */}
      <div className="relative z-10">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/90 backdrop-blur-md border border-teal-200/90 text-teal-800 text-xs font-semibold shadow-xs">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Mumbai Transit Network • Real-time Operations</span>
        </div>
      </div>

      {/* Center Animated Scenic Layer: Track, Parallax Masts, Moving Suburban Local Train */}
      <div className="relative w-full my-auto py-12 overflow-hidden flex items-center justify-center">
        {/* Parallax Distant Station Lights (Slow layer) */}
        <motion.div
          className="absolute inset-x-0 top-6 flex items-center justify-around opacity-40 pointer-events-none"
          animate={{ x: [-80, 0] }}
          transition={{
            repeat: Infinity,
            repeatType: 'loop',
            duration: 16,
            ease: 'linear'
          }}
        >
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex flex-col items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-amber-400 blur-[1px] shadow-[0_0_8px_#fbbf24]" />
              <div className="w-[1px] h-12 bg-slate-300" />
            </div>
          ))}
        </motion.div>

        {/* Overhead Catenary Power Wire */}
        <div className="absolute inset-x-0 top-14 h-[1px] bg-slate-300/80 pointer-events-none" />
        <div className="absolute inset-x-0 top-20 h-[1px] bg-slate-200/80 pointer-events-none" />

        {/* Catenary Support Masts (Medium speed parallax) */}
        <motion.div
          className="absolute inset-x-0 top-10 flex items-center justify-around opacity-45 pointer-events-none"
          animate={{ x: [-140, 0] }}
          transition={{
            repeat: Infinity,
            repeatType: 'loop',
            duration: 7,
            ease: 'linear'
          }}
        >
          {Array.from({ length: 5 }).map((_, idx) => (
            <div key={idx} className="flex flex-col items-center">
              <div className="w-12 h-1 border-t-2 border-r border-l border-slate-400" />
              <div className="w-[2px] h-20 bg-slate-300" />
            </div>
          ))}
        </motion.div>

        {/* Moving Stylized Local Train (Matching Light GoFlow Palette) */}
        <div className="relative w-full h-32 flex items-center overflow-hidden">
          <motion.div
            className="flex items-end gap-1.5"
            animate={{
              x: ['-120%', '130%']
            }}
            transition={{
              repeat: Infinity,
              duration: 9.5,
              ease: 'easeInOut'
            }}
          >
            {/* Coach 3 (Suburban Commuter Coach - Rich Transit Navy/Teal with Illuminated Windows) */}
            <div className="relative w-28 h-14 bg-gradient-to-b from-slate-800 via-slate-900 to-[#0a192f] rounded-t-sm border border-slate-700/90 flex flex-col justify-between p-2 shadow-md">
              <div className="w-full h-[1px] bg-teal-400/30 rounded-full" />
              <div className="flex justify-around items-center pt-0.5">
                <span className="w-3.5 h-4 bg-cyan-100 rounded-2xs border border-cyan-300 shadow-[0_0_6px_rgba(34,211,238,0.5)]" />
                <span className="w-3.5 h-4 bg-cyan-100 rounded-2xs border border-cyan-300 shadow-[0_0_6px_rgba(34,211,238,0.5)]" />
                <span className="w-3.5 h-4 bg-cyan-100 rounded-2xs border border-cyan-300 shadow-[0_0_6px_rgba(34,211,238,0.5)]" />
                <span className="w-3.5 h-4 bg-cyan-100 rounded-2xs border border-cyan-300 shadow-[0_0_6px_rgba(34,211,238,0.5)]" />
              </div>
              <div className="w-full h-1.5 bg-gradient-to-r from-transit-teal via-teal-400 to-teal-300 rounded-xs shadow-[0_0_4px_rgba(45,212,191,0.6)]" />
              {/* Bogie Wheels */}
              <div className="absolute -bottom-2 inset-x-2 flex justify-between">
                <span className="w-3.5 h-3.5 rounded-full bg-slate-900 border-2 border-slate-400 shadow-xs flex items-center justify-center">
                  <span className="w-1 h-1 rounded-full bg-slate-300" />
                </span>
                <span className="w-3.5 h-3.5 rounded-full bg-slate-900 border-2 border-slate-400 shadow-xs flex items-center justify-center">
                  <span className="w-1 h-1 rounded-full bg-slate-300" />
                </span>
              </div>
            </div>

            {/* Coach 2 (Suburban Commuter Coach - Rich Transit Navy/Teal with Illuminated Windows) */}
            <div className="relative w-28 h-14 bg-gradient-to-b from-slate-800 via-slate-900 to-[#0a192f] rounded-t-sm border border-slate-700/90 flex flex-col justify-between p-2 shadow-md">
              <div className="w-full h-[1px] bg-teal-400/30 rounded-full" />
              <div className="flex justify-around items-center pt-0.5">
                <span className="w-3.5 h-4 bg-cyan-100 rounded-2xs border border-cyan-300 shadow-[0_0_6px_rgba(34,211,238,0.5)]" />
                <span className="w-3.5 h-4 bg-cyan-100 rounded-2xs border border-cyan-300 shadow-[0_0_6px_rgba(34,211,238,0.5)]" />
                <span className="w-3.5 h-4 bg-cyan-100 rounded-2xs border border-cyan-300 shadow-[0_0_6px_rgba(34,211,238,0.5)]" />
                <span className="w-3.5 h-4 bg-cyan-100 rounded-2xs border border-cyan-300 shadow-[0_0_6px_rgba(34,211,238,0.5)]" />
              </div>
              <div className="w-full h-1.5 bg-gradient-to-r from-transit-teal via-teal-400 to-teal-300 rounded-xs shadow-[0_0_4px_rgba(45,212,191,0.6)]" />
              {/* Bogie Wheels */}
              <div className="absolute -bottom-2 inset-x-2 flex justify-between">
                <span className="w-3.5 h-3.5 rounded-full bg-slate-900 border-2 border-slate-400 shadow-xs flex items-center justify-center">
                  <span className="w-1 h-1 rounded-full bg-slate-300" />
                </span>
                <span className="w-3.5 h-3.5 rounded-full bg-slate-900 border-2 border-slate-400 shadow-xs flex items-center justify-center">
                  <span className="w-1 h-1 rounded-full bg-slate-300" />
                </span>
              </div>
            </div>

            {/* Coach 1 (Mumbai First Class Coach - Distinct Golden-Amber Band & Illumination) */}
            <div className="relative w-28 h-14 bg-gradient-to-b from-slate-800 via-slate-900 to-[#0a192f] rounded-t-sm border border-slate-700/90 flex flex-col justify-between p-2 shadow-md">
              <div className="w-full h-[1px] bg-amber-400/30 rounded-full" />
              <div className="flex justify-around items-center pt-0.5">
                <span className="w-3.5 h-4 bg-amber-100 rounded-2xs border border-amber-300 shadow-[0_0_6px_rgba(251,191,36,0.6)]" />
                <span className="w-3.5 h-4 bg-amber-100 rounded-2xs border border-amber-300 shadow-[0_0_6px_rgba(251,191,36,0.6)]" />
                <span className="w-3.5 h-4 bg-amber-100 rounded-2xs border border-amber-300 shadow-[0_0_6px_rgba(251,191,36,0.6)]" />
                <span className="w-3.5 h-4 bg-amber-100 rounded-2xs border border-amber-300 shadow-[0_0_6px_rgba(251,191,36,0.6)]" />
              </div>
              <div className="w-full h-1.5 bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 rounded-xs shadow-[0_0_6px_rgba(245,158,11,0.6)]" />
              {/* Bogie Wheels */}
              <div className="absolute -bottom-2 inset-x-2 flex justify-between">
                <span className="w-3.5 h-3.5 rounded-full bg-slate-900 border-2 border-slate-400 shadow-xs flex items-center justify-center">
                  <span className="w-1 h-1 rounded-full bg-slate-300" />
                </span>
                <span className="w-3.5 h-3.5 rounded-full bg-slate-900 border-2 border-slate-400 shadow-xs flex items-center justify-center">
                  <span className="w-1 h-1 rounded-full bg-slate-300" />
                </span>
              </div>
            </div>

            {/* Leading Train Engine (GoFlow Suburban EMU / Metro front) */}
            <div className="relative w-32 h-15 bg-gradient-to-r from-teal-800 to-teal-900 rounded-t-sm rounded-r-2xl border border-teal-700 flex flex-col justify-between p-2 shadow-md">
              {/* Pantograph roof mount */}
              <div className="absolute -top-3 left-4 w-6 h-3 border-t-2 border-r-2 border-teal-400 rotate-12" />

              {/* Windshield & Cab windows */}
              <div className="flex items-center gap-2 pt-1 pl-1">
                <span className="w-4 h-4 bg-teal-100/40 rounded-xs border border-teal-300/30" />
                <span className="w-7 h-4 bg-teal-100/60 rounded-xs border-r-2 border-teal-300" />
              </div>

              {/* Destination board & Headlight */}
              <div className="flex items-center justify-between pb-0.5">
                <div className="text-[8px] font-mono text-teal-300 bg-teal-950 px-1.5 py-0.5 rounded border border-teal-700 shadow-2xs">
                  CSMT FAST
                </div>
                {/* Powerful warm locomotive headlight */}
                <div className="relative">
                  <div className="w-2.5 h-3 bg-amber-300 rounded-r-md shadow-[0_0_14px_#fbbf24]" />
                  {/* Projected light beam */}
                  <div className="absolute top-1/2 -translate-y-1/2 left-3 w-40 h-10 bg-gradient-to-r from-amber-200/50 to-transparent blur-md pointer-events-none transform -skew-y-3" />
                </div>
              </div>

              {/* Signage Teal & Yellow strip */}
              <div className="w-full h-1.5 bg-gradient-to-r from-transit-teal via-teal-300 to-amber-300 rounded-xs" />

              {/* Bogie Wheels */}
              <div className="absolute -bottom-2 inset-x-2 flex justify-between">
                <span className="w-3 h-3 rounded-full bg-slate-700 border border-slate-400 shadow-2xs" />
                <span className="w-3 h-3 rounded-full bg-slate-700 border border-slate-400 shadow-2xs" />
              </div>
            </div>
          </motion.div>
        </div>

        {/* Rail Tracks & Sleepers (Base Ground) */}
        <div className="absolute inset-x-0 bottom-6 flex flex-col items-center">
          {/* Top Rail */}
          <div className="w-full h-[2px] bg-slate-400 shadow-xs" />
          {/* Rail Sleepers */}
          <div
            className="w-full h-2.5 opacity-50"
            style={{
              backgroundImage:
                'repeating-linear-gradient(90deg, #94a3b8 0px, #94a3b8 4px, transparent 4px, transparent 18px)'
            }}
          />
          {/* Bottom Rail */}
          <div className="w-full h-[2px] bg-slate-400 shadow-xs" />
          {/* Ballast Stone Bed */}
          <div className="w-full h-3 bg-slate-200/90 border-t border-slate-300" />
        </div>
      </div>

      {/* Bottom Editorial Copy & Pillars */}
      <div className="relative z-10 space-y-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-transit-navy leading-snug">
            The Lifeline of Mumbai, <br />
            <span className="text-transit-teal">Crowd-Aware &amp; Synchronized.</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed max-w-md">
            Integrated suburban corridors, high-capacity metro lines, and BEST feeder transit with verified platform crowd metrics.
          </p>
        </div>

        {/* Feature Badges - matching clean GoFlow design tokens */}
        <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-200/80 text-xs">
          <div className="flex items-center gap-1.5 p-2 rounded-transit bg-white/80 border border-slate-200/80 text-slate-700 shadow-2xs">
            <Zap size={14} className="text-transit-teal shrink-0" />
            <span className="text-[11px] font-medium">Live SDCL Metrics</span>
          </div>
          <div className="flex items-center gap-1.5 p-2 rounded-transit bg-white/80 border border-slate-200/80 text-slate-700 shadow-2xs">
            <Compass size={14} className="text-transit-teal shrink-0" />
            <span className="text-[11px] font-medium">Interchange Bridges</span>
          </div>
          <div className="flex items-center gap-1.5 p-2 rounded-transit bg-white/80 border border-slate-200/80 text-slate-700 shadow-2xs">
            <Shield size={14} className="text-transit-teal shrink-0" />
            <span className="text-[11px] font-medium">Verified Reports</span>
          </div>
        </div>
      </div>
    </div>
  );
};

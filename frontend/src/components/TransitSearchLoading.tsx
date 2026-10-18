import React from 'react';
import { motion } from 'framer-motion';

interface TransitSearchLoadingProps {
  label?: string;
}

export const TransitSearchLoading: React.FC<TransitSearchLoadingProps> = ({
  label = 'Calculating optimal crowd-aware transit paths...'
}) => {
  return (
    <div className="w-full py-6 flex flex-col items-center justify-center space-y-4">
      {/* Train track & moving train indicator */}
      <div className="relative w-64 h-10 flex items-center overflow-hidden">
        {/* Rail track (dotted line) */}
        <div className="absolute inset-x-0 h-[2px] bg-slate-200 border-b-2 border-dotted border-slate-300" />

        {/* Moving local train silhouette */}
        <motion.div
          className="absolute flex items-center gap-1"
          initial={{ x: -70 }}
          animate={{ x: 260 }}
          transition={{
            repeat: Infinity,
            duration: 2.2,
            ease: 'easeInOut'
          }}
        >
          {/* Mumbai Local Train silhouette: Engine + 2 Coaches */}
          <div className="flex items-center gap-0.5">
            {/* Coach 2 */}
            <div className="w-9 h-4.5 bg-slate-400 rounded-xs flex items-center justify-around px-1 shadow-xs">
              <span className="w-1.5 h-1.5 bg-white/70 rounded-2xs" />
              <span className="w-1.5 h-1.5 bg-white/70 rounded-2xs" />
              <span className="w-1.5 h-1.5 bg-white/70 rounded-2xs" />
            </div>

            {/* Coach 1 */}
            <div className="w-9 h-4.5 bg-slate-500 rounded-xs flex items-center justify-around px-1 shadow-xs">
              <span className="w-1.5 h-1.5 bg-white/80 rounded-2xs" />
              <span className="w-1.5 h-1.5 bg-white/80 rounded-2xs" />
              <span className="w-1.5 h-1.5 bg-white/80 rounded-2xs" />
            </div>

            {/* Leading Engine Car with Signage Teal Accent */}
            <div className="relative w-11 h-5 bg-transit-teal rounded-r-md rounded-l-xs flex items-center justify-between px-1 shadow-xs">
              {/* Roof Pantograph */}
              <div className="absolute -top-1.5 left-2 w-3 h-1.5 border-t border-r border-teal-800 rotate-12" />
              {/* Windows */}
              <span className="w-1.5 h-1.5 bg-teal-100 rounded-2xs" />
              <span className="w-1.5 h-1.5 bg-teal-100 rounded-2xs" />
              {/* Headlight beam */}
              <div className="w-1 h-2 bg-amber-300 rounded-r-xs shadow-[0_0_8px_#fbbf24]" />
            </div>
          </div>
        </motion.div>
      </div>

      <p className="text-xs text-slate-600 font-medium animate-pulse">
        {label}
      </p>
    </div>
  );
};

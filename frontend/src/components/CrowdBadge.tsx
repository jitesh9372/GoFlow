import React from 'react';
import { ShieldCheck, Users, Radio, History, Sparkles } from 'lucide-react';
import { CrowdLevel, CrowdSource } from '../types';

interface CrowdBadgeProps {
  level: CrowdLevel;
  occupancy?: number;
  source?: CrowdSource;
  verified?: boolean;
  size?: 'sm' | 'md' | 'lg';
  showDetails?: boolean;
}

export const getCrowdLevelInfo = (level: CrowdLevel) => {
  switch (level) {
    case 'low':
      return {
        label: 'Comfortable',
        sublabel: 'Low Crowd (<40%)',
        textColor: 'text-emerald-800',
        bgColor: 'bg-emerald-50',
        borderColor: 'border-emerald-200',
        dotColor: 'bg-emerald-600',
        hex: '#15803d'
      };
    case 'medium':
      return {
        label: 'Moderate Rush',
        sublabel: 'Standing Room (40-75%)',
        textColor: 'text-amber-800',
        bgColor: 'bg-amber-50',
        borderColor: 'border-amber-200',
        dotColor: 'bg-amber-600',
        hex: '#d97706'
      };
    case 'high':
      return {
        label: 'Dense / SDCL',
        sublabel: 'Super Dense Crush (>75%)',
        textColor: 'text-rose-800',
        bgColor: 'bg-rose-50',
        borderColor: 'border-rose-200',
        dotColor: 'bg-rose-600',
        hex: '#dc2626'
      };
  }
};

export const getSourceLabel = (source?: CrowdSource) => {
  switch (source) {
    case 'live_sensor':
      return { label: 'Live Sensor', icon: Radio };
    case 'verified_survey':
      return { label: 'Verified Survey', icon: ShieldCheck };
    case 'passenger_report':
      return { label: 'Passenger Report', icon: Users };
    case 'historical_pattern':
      return { label: 'Historical Trend', icon: History };
    case 'predicted':
      return { label: 'AI Predicted', icon: Sparkles };
    default:
      return { label: 'Transit Data', icon: Radio };
  }
};

export const CrowdBadge: React.FC<CrowdBadgeProps> = ({
  level,
  occupancy,
  source,
  verified = false,
  size = 'md',
  showDetails = false
}) => {
  const info = getCrowdLevelInfo(level);
  const src = getSourceLabel(source);
  const SourceIcon = src.icon;

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-xs px-2.5 py-1',
    lg: 'text-sm px-3 py-1.5'
  }[size];

  const isHigh = level === 'high';

  return (
    <div className="inline-flex flex-col gap-1">
      <div
        className={`inline-flex items-center gap-1.5 rounded border font-medium ${info.bgColor} ${info.borderColor} ${info.textColor} ${sizeClasses}`}
      >
        <span
          className={`w-2 h-2 rounded-full ${info.dotColor} shrink-0 ${
            isHigh ? 'animate-pulse' : ''
          }`}
        />
        <span>{info.label}</span>
        {occupancy !== undefined && (
          <span className="font-mono opacity-80 border-l border-current/20 pl-1.5 ml-0.5">
            {occupancy}%
          </span>
        )}
        {verified && (
          <span title="Verified by GoFlow Control" className="inline-flex items-center">
            <ShieldCheck size={13} className="text-emerald-700 ml-0.5 shrink-0" />
          </span>
        )}
      </div>

      {showDetails && source && (
        <div className="flex items-center gap-1 text-[11px] text-slate-500">
          <SourceIcon size={12} className="shrink-0" />
          <span>Source: {src.label}</span>
        </div>
      )}
    </div>
  );
};

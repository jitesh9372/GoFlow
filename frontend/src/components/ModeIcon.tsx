import React from 'react';
import { Train, Bus, Compass, Navigation, ArrowRightLeft } from 'lucide-react';
import { TransportMode } from '../types';

interface ModeIconProps {
  mode: TransportMode | 'walk' | 'transfer';
  className?: string;
  size?: number;
}

export const ModeIcon: React.FC<ModeIconProps> = ({ mode, className = '', size = 18 }) => {
  switch (mode) {
    case 'train':
      return <Train size={size} className={className} />;
    case 'metro':
      return <Compass size={size} className={className} />;
    case 'bus':
      return <Bus size={size} className={className} />;
    case 'walk':
      return <Navigation size={size} className={className} />;
    case 'transfer':
      return <ArrowRightLeft size={size} className={className} />;
    default:
      return <Train size={size} className={className} />;
  }
};

export const getModeBadgeStyle = (mode: TransportMode) => {
  switch (mode) {
    case 'train':
      return 'bg-teal-50 text-teal-800 border-teal-200';
    case 'metro':
      return 'bg-sky-50 text-sky-800 border-sky-200';
    case 'bus':
      return 'bg-amber-50 text-amber-800 border-amber-200';
  }
};

export const getModeLabel = (mode: TransportMode) => {
  switch (mode) {
    case 'train':
      return 'Local Train';
    case 'metro':
      return 'Mumbai Metro';
    case 'bus':
      return 'BEST Bus';
  }
};

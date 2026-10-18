import React, { useState, useEffect, useRef } from 'react';
import { Search, MapPin, X, ChevronDown } from 'lucide-react';
import { Station } from '../types';
import { ModeIcon } from './ModeIcon';

interface StationSearchInputProps {
  label: string;
  placeholder?: string;
  selectedStationId?: string;
  stations: Station[];
  onSelectStation: (station: Station | null) => void;
  className?: string;
}

export const StationSearchInput: React.FC<StationSearchInputProps> = ({
  label,
  placeholder = 'Search station or bus stop...',
  selectedStationId,
  stations,
  onSelectStation,
  className = ''
}) => {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const selectedStation = stations.find(s => s.id === selectedStationId);

  useEffect(() => {
    if (selectedStation) {
      setQuery(selectedStation.name);
    } else {
      setQuery('');
    }
  }, [selectedStationId, stations]);

  // Click outside listener
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredStations = stations.filter(s => {
    if (!query || (selectedStation && query === selectedStation.name)) return true;
    const q = query.toLowerCase().trim();
    return (
      s.name.toLowerCase().includes(q) ||
      (s.marathiName && s.marathiName.includes(q)) ||
      s.code.toLowerCase().includes(q) ||
      (s.zone && s.zone.toLowerCase().includes(q))
    );
  }).slice(0, 10);

  const handleSelect = (station: Station) => {
    onSelectStation(station);
    setQuery(station.name);
    setIsOpen(false);
  };

  const handleClear = () => {
    onSelectStation(null);
    setQuery('');
    setIsOpen(false);
  };

  return (
    <div ref={wrapperRef} className={`relative flex flex-col gap-1.5 ${className}`}>
      <label className="text-xs font-medium text-slate-700 flex items-center justify-between">
        <span className="font-semibold text-transit-navy">{label}</span>
        {selectedStation && (
          <span className="text-[11px] font-mono text-slate-400 bg-slate-100 px-1.5 py-0.2 rounded">
            {selectedStation.code}
          </span>
        )}
      </label>

      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
          {selectedStation ? (
            <ModeIcon mode={selectedStation.mode} size={15} className="text-transit-teal" />
          ) : (
            <Search size={15} />
          )}
        </div>

        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
            if (!e.target.value) {
              onSelectStation(null);
            }
          }}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder}
          className="w-full pl-10 pr-12 py-2.5 text-sm bg-white border border-slate-200 hover:border-slate-300 rounded-xl text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-transit-teal/20 focus:border-transit-teal transition-all shadow-2xs"
        />

        <div className="absolute inset-y-0 right-0 pr-2.5 flex items-center gap-1">
          {selectedStation && (
            <button
              type="button"
              onClick={handleClear}
              className="p-1 text-slate-400 hover:text-slate-700 transition-colors"
              title="Clear selection"
            >
              <X size={14} />
            </button>
          )}
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="p-1 text-slate-400 hover:text-slate-700 transition-colors"
          >
            <ChevronDown size={14} />
          </button>
        </div>
      </div>

      {isOpen && (
        <div className="absolute z-50 top-full left-0 right-0 mt-1.5 max-h-64 overflow-y-auto bg-white border border-slate-200 rounded-xl shadow-elevated py-1 text-sm divide-y divide-slate-100">
          {filteredStations.length === 0 ? (
            <div className="px-3 py-4 text-center text-transit-muted text-xs">
              No matching Mumbai transit stations found
            </div>
          ) : (
            filteredStations.map((station) => (
              <button
                key={station.id}
                type="button"
                onClick={() => handleSelect(station)}
                className={`w-full text-left px-3 py-2 flex items-center justify-between hover:bg-slate-50 transition-colors ${
                  selectedStationId === station.id ? 'bg-teal-50/60 font-medium' : ''
                }`}
              >
                <div className="flex items-center gap-2.5 overflow-hidden">
                  <div className="p-1 rounded bg-slate-100 shrink-0 text-slate-600">
                    <ModeIcon mode={station.mode} size={14} />
                  </div>
                  <div className="truncate">
                    <div className="text-transit-navy truncate font-medium">
                      {station.name}
                      {station.marathiName && (
                        <span className="text-slate-500 font-normal text-xs ml-1.5 opacity-90">
                          ({station.marathiName})
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-transit-muted truncate">
                      {station.zone || 'Mumbai Transit Area'}
                      {station.isInterchange && (
                        <span className="ml-1 text-teal-700 font-medium">
                          • Junction Interchange
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <span className="text-xs font-mono px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 shrink-0 ml-2">
                  {station.code}
                </span>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
};

import React, { useState } from 'react';
import {
  Clock,
  IndianRupee,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  Bookmark,
  Sparkles,
  MapPin,
  Compass,
  Bus,
  Train,
  CreditCard,
  DoorOpen,
  Zap,
  ShieldCheck,
  Check
} from 'lucide-react';
import { RouteOption } from '../types';
import { CrowdBadge } from './CrowdBadge';
import { ModeIcon } from './ModeIcon';

interface RouteCardProps {
  route: RouteOption;
  onSaveRoute?: (route: RouteOption) => void;
  onSelectOnMap?: (route: RouteOption) => void;
  isSaved?: boolean;
}

export const RouteCard: React.FC<RouteCardProps> = ({
  route,
  onSaveRoute,
  onSelectOnMap,
  isSaved = false
}) => {
  const [expanded, setExpanded] = useState(false);
  const [showFeeders, setShowFeeders] = useState(false);

  const hasMetro = route.modes.includes('metro');
  const hasBus = route.modes.includes('bus');

  return (
    <div className="bg-white border border-slate-200/90 rounded-xl shadow-2xs hover:shadow-xs hover:border-teal-300 transition-all duration-150 p-4 flex flex-col gap-3">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex-1 min-w-[200px]">
          <div className="flex flex-wrap items-center gap-1.5 mb-1.5">
            {route.modes.map((mode) => (
              <span
                key={mode}
                className={`inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-md font-medium ${
                  mode === 'metro'
                    ? 'bg-sky-50 text-sky-800 border border-sky-200/80'
                    : mode === 'bus'
                    ? 'bg-amber-50 text-amber-800 border border-amber-200/80'
                    : 'bg-teal-50 text-teal-800 border border-teal-200/80'
                }`}
              >
                <ModeIcon mode={mode} size={11} />
                <span className="capitalize">{mode === 'train' ? 'Local Train' : mode === 'metro' ? 'Metro' : 'BEST Bus'}</span>
              </span>
            ))}

            {route.totalTransfers === 0 && (
              <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200/80 font-medium">
                Direct
              </span>
            )}
          </div>

          <h4 className="font-semibold text-transit-navy text-base">
            {route.title}
          </h4>
          <p className="text-xs text-transit-muted mt-0.5">
            {route.subtitle}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <CrowdBadge
            level={route.overallCrowd}
            occupancy={route.crowdScore}
            source={route.steps[0]?.crowdSource}
            showDetails={true}
          />
        </div>
      </div>

      {/* Primary Metrics Row */}
      <div className="grid grid-cols-3 divide-x divide-slate-100 bg-slate-50/70 border border-slate-100 rounded-transit py-2 px-3 text-center">
        <div>
          <span className="text-[11px] uppercase tracking-wider text-transit-muted flex items-center justify-center gap-1">
            <Clock size={12} /> Duration
          </span>
          <span className="text-sm font-semibold text-transit-navy block mt-0.5">
            ~{route.totalDurationMins} mins
          </span>
        </div>
        <div>
          <span className="text-[11px] uppercase tracking-wider text-transit-muted">
            Transfers
          </span>
          <span className="text-sm font-semibold text-transit-navy block mt-0.5">
            {route.totalTransfers === 0 ? 'Direct (0)' : `${route.totalTransfers} change`}
          </span>
        </div>
        <div>
          <span className="text-[11px] uppercase tracking-wider text-transit-muted flex items-center justify-center gap-1">
            <IndianRupee size={12} /> Total Fare
          </span>
          <span className="text-sm font-semibold text-transit-navy block mt-0.5 font-mono">
            ₹{route.estimatedFareRupees}
          </span>
        </div>
      </div>

      {/* Highlights */}
      {route.highlights && route.highlights.length > 0 && (
        <ul className="text-xs text-slate-600 space-y-1">
          {route.highlights.map((item, idx) => (
            <li key={idx} className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-transit-teal shrink-0" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      )}

      {/* Recommended Coach Tip */}
      {route.recommendedCoach && (
        <div className="bg-teal-50/60 border border-teal-100 rounded-transit px-3 py-2 text-xs flex items-start gap-2 text-teal-900">
          <Sparkles size={14} className="text-transit-teal shrink-0 mt-0.5" />
          <div>
            <strong className="font-medium">Commuter Tip: </strong>
            <span>{route.recommendedCoach}</span>
          </div>
        </div>
      )}

      {/* Action Bar */}
      <div className="flex flex-wrap items-center justify-between pt-2 border-t border-slate-100 text-xs gap-2">
        <div className="flex items-center gap-2">
          {onSaveRoute && (
            <button
              onClick={() => onSaveRoute(route)}
              className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-transit border transition-colors ${
                isSaved
                  ? 'bg-amber-50 text-amber-800 border-amber-300 font-medium'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}
            >
              <Bookmark size={13} className={isSaved ? 'fill-amber-600' : ''} />
              <span>{isSaved ? 'Saved Route' : 'Save Route'}</span>
            </button>
          )}

          {onSelectOnMap && (
            <button
              onClick={() => onSelectOnMap(route)}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-transit border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
            >
              <MapPin size={13} className="text-transit-teal" />
              <span>Preview on Map</span>
            </button>
          )}

          {route.transitConnections && (
            <button
              onClick={() => setShowFeeders(!showFeeders)}
              className={`inline-flex items-center gap-1 px-2 py-1.5 rounded-transit border transition-colors ${
                showFeeders
                  ? 'bg-sky-50 text-sky-800 border-sky-300 font-medium'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}
              title="Show nearby connecting Metro stations & BEST buses"
            >
              <Bus size={12} className="text-amber-600" />
              <span>Feeder Connections</span>
              {showFeeders ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
            </button>
          )}
        </div>

        <button
          onClick={() => setExpanded(!expanded)}
          className="inline-flex items-center gap-1 text-transit-teal font-medium hover:underline py-1"
        >
          <span>{expanded ? 'Hide Step Details' : 'Step-by-Step Route Details'}</span>
          {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>
      </div>

      {/* Expandable Station Feeder Connections (Metro & BEST Buses) */}
      {showFeeders && route.transitConnections && (
        <div className="p-3 bg-gradient-to-r from-slate-50 to-sky-50/40 rounded-transit border border-slate-200 space-y-3 text-xs animate-fadeIn">
          <div className="flex items-center justify-between border-b border-slate-200 pb-1.5">
            <h5 className="font-semibold text-slate-800 flex items-center gap-1.5">
              <Bus size={13} className="text-amber-600" />
              <span>Connecting Metro &amp; BEST Feeder Services</span>
            </h5>
            <span className="text-[10px] text-slate-500">Live corridor transfers</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* Origin Feeders */}
            <div className="bg-white p-2.5 rounded border border-slate-200/80 space-y-2">
              <div className="font-semibold text-slate-800 text-[11px] flex items-center justify-between">
                <span>At Origin ({route.steps[0]?.fromStationName}):</span>
                <span className="text-[10px] text-teal-700 bg-teal-50 px-1.5 py-0.5 rounded">Boarding</span>
              </div>

              {route.transitConnections.originMetroStations && route.transitConnections.originMetroStations.length > 0 && (
                <div className="space-y-1">
                  <span className="text-[10px] text-slate-500 font-medium uppercase tracking-wider block">Nearby Metro Stations:</span>
                  {route.transitConnections.originMetroStations.map((m, i) => (
                    <div key={i} className="flex items-center justify-between text-[11px] text-sky-900 bg-sky-50/60 p-1.5 rounded border border-sky-100">
                      <span className="font-medium flex items-center gap-1">
                        <Compass size={12} className="text-sky-600" /> {m.name}
                      </span>
                      <span className="text-[10px] text-slate-500">~{m.distanceWalkMins} min walk</span>
                    </div>
                  ))}
                </div>
              )}

              {route.transitConnections.originBestBuses && route.transitConnections.originBestBuses.length > 0 && (
                <div className="space-y-1 pt-1">
                  <span className="text-[10px] text-slate-500 font-medium uppercase tracking-wider block">Departing BEST Buses:</span>
                  {route.transitConnections.originBestBuses.map((b, i) => (
                    <div key={i} className="flex items-center justify-between text-[11px] bg-amber-50/60 p-1.5 rounded border border-amber-100 text-amber-950">
                      <div className="flex items-center gap-1">
                        <span className="font-bold font-mono px-1 bg-amber-100 rounded text-[10px] text-amber-900">{b.routeNumber}</span>
                        <span className="text-slate-600 text-[10px]">➔ {b.destination}</span>
                      </div>
                      <span className="text-[10px] text-slate-500">{b.frequency}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Destination Feeders */}
            <div className="bg-white p-2.5 rounded border border-slate-200/80 space-y-2">
              <div className="font-semibold text-slate-800 text-[11px] flex items-center justify-between">
                <span>At Destination ({route.steps[route.steps.length - 1]?.toStationName}):</span>
                <span className="text-[10px] text-sky-700 bg-sky-50 px-1.5 py-0.5 rounded">Arrival / Exit</span>
              </div>

              {route.transitConnections.destinationMetroStations && route.transitConnections.destinationMetroStations.length > 0 && (
                <div className="space-y-1">
                  <span className="text-[10px] text-slate-500 font-medium uppercase tracking-wider block">Connecting Metro Links:</span>
                  {route.transitConnections.destinationMetroStations.map((m, i) => (
                    <div key={i} className="flex items-center justify-between text-[11px] text-sky-900 bg-sky-50/60 p-1.5 rounded border border-sky-100">
                      <span className="font-medium flex items-center gap-1">
                        <Compass size={12} className="text-sky-600" /> {m.name}
                      </span>
                      <span className="text-[10px] text-slate-500">~{m.distanceWalkMins} min walk</span>
                    </div>
                  ))}
                </div>
              )}

              {route.transitConnections.destinationBestBuses && route.transitConnections.destinationBestBuses.length > 0 && (
                <div className="space-y-1 pt-1">
                  <span className="text-[10px] text-slate-500 font-medium uppercase tracking-wider block">Connecting BEST Feeder Buses:</span>
                  {route.transitConnections.destinationBestBuses.map((b, i) => (
                    <div key={i} className="flex items-center justify-between text-[11px] bg-amber-50/60 p-1.5 rounded border border-amber-100 text-amber-950">
                      <div className="flex items-center gap-1">
                        <span className="font-bold font-mono px-1 bg-amber-100 rounded text-[10px] text-amber-900">{b.routeNumber}</span>
                        <span className="text-slate-600 text-[10px]">➔ {b.destination}</span>
                      </div>
                      <span className="text-[10px] text-slate-500">{b.frequency}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Collapsible Step Details */}
      {expanded && (
        <div className="pt-2 border-t border-slate-100 space-y-4">
          {route.steps.map((step, idx) => (
            <div key={idx} className="relative pl-6 pb-2 last:pb-0">
              {/* Timeline Connector Line */}
              {idx < route.steps.length - 1 && (
                <div className="absolute left-2.5 top-6 bottom-0 w-0.5 bg-slate-200" />
              )}

              {/* Mode Circle Marker */}
              <div
                className="absolute left-0 top-1 w-5 h-5 rounded-full flex items-center justify-center text-white shadow-xs"
                style={{ backgroundColor: step.lineColor || (step.mode === 'metro' ? '#0284c7' : step.mode === 'bus' ? '#ea580c' : '#0f766e') }}
              >
                <ModeIcon mode={step.mode} size={11} className="text-white" />
              </div>

              <div className="text-xs space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="font-semibold text-transit-navy text-sm">
                      {step.lineName}
                    </span>
                    <span className={`text-[10px] uppercase font-bold px-1.5 py-0.2 rounded font-mono ${
                      step.mode === 'metro'
                        ? 'bg-sky-100 text-sky-800'
                        : step.mode === 'bus'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-teal-100 text-teal-800'
                    }`}>
                      {step.mode}
                    </span>
                  </div>

                  <span className="text-transit-muted font-mono text-[11px]">
                    ~{step.durationMins} mins ({step.stopsCount} stops)
                  </span>
                </div>

                <div className="flex items-center gap-1.5 text-slate-700">
                  <span className="font-medium text-slate-900">{step.fromStationName}</span>
                  <ArrowRight size={12} className="text-slate-400 shrink-0" />
                  <span className="font-medium text-slate-900">{step.toStationName}</span>
                </div>

                <p className="text-slate-600 text-[11px] leading-relaxed bg-slate-50 p-2 rounded border border-slate-100">
                  {step.instructions}
                </p>

                {/* --- DETAILED METRO CARD SNIPPET --- */}
                {step.metroDetails && (
                  <div className="bg-sky-50/70 border border-sky-200 rounded-transit p-2.5 text-[11px] space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-sky-900 flex items-center gap-1.5">
                        <Compass size={13} className="text-sky-600" />
                        <span>Mumbai Metro Details ({step.metroDetails.lineCode})</span>
                      </span>
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-sky-100 text-sky-800 font-medium">
                        {step.metroDetails.operator}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-700">
                      <div className="flex items-start gap-1.5">
                        <Clock size={12} className="text-sky-600 shrink-0 mt-0.5" />
                        <div>
                          <strong className="text-slate-800">Frequency / Headway:</strong>
                          <span className="block text-slate-600">{step.metroDetails.frequencyText}</span>
                        </div>
                      </div>

                      {step.metroDetails.platformOrGate && (
                        <div className="flex items-start gap-1.5">
                          <DoorOpen size={12} className="text-sky-600 shrink-0 mt-0.5" />
                          <div>
                            <strong className="text-slate-800">Platform &amp; Gate:</strong>
                            <span className="block text-slate-600">{step.metroDetails.platformOrGate}</span>
                          </div>
                        </div>
                      )}

                      <div className="flex items-start gap-1.5">
                        <Zap size={12} className="text-sky-600 shrink-0 mt-0.5" />
                        <div>
                          <strong className="text-slate-800">Amenities:</strong>
                          <span className="block text-slate-600">Full Air-Conditioned Trains • Screen Doors</span>
                        </div>
                      </div>

                      <div className="flex items-start gap-1.5">
                        <CreditCard size={12} className="text-sky-600 shrink-0 mt-0.5" />
                        <div>
                          <strong className="text-slate-800">Ticketing:</strong>
                          <span className="block text-slate-600">{step.metroDetails.ticketingOptions.join(' • ')}</span>
                        </div>
                      </div>
                    </div>

                    {step.metroDetails.interchangeFOB && (
                      <div className="pt-1 text-[10px] text-sky-800 flex items-center gap-1">
                        <Check size={11} className="text-emerald-600" />
                        <span>{step.metroDetails.interchangeFOB}</span>
                      </div>
                    )}
                  </div>
                )}

                {/* --- DETAILED BEST BUS CARD SNIPPET --- */}
                {step.busDetails && (
                  <div className="bg-amber-50/70 border border-amber-200 rounded-transit p-2.5 text-[11px] space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-amber-900 flex items-center gap-1.5">
                        <Bus size={13} className="text-amber-600" />
                        <span>BEST Bus Route Details ({step.busDetails.busRouteNumber})</span>
                      </span>
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 font-medium">
                        {step.busDetails.busType}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-700">
                      <div className="flex items-start gap-1.5">
                        <MapPin size={12} className="text-amber-600 shrink-0 mt-0.5" />
                        <div>
                          <strong className="text-slate-800">Boarding Stand:</strong>
                          <span className="block text-slate-600">{step.busDetails.boardingStop}</span>
                        </div>
                      </div>

                      <div className="flex items-start gap-1.5">
                        <Clock size={12} className="text-amber-600 shrink-0 mt-0.5" />
                        <div>
                          <strong className="text-slate-800">Frequency &amp; Timings:</strong>
                          <span className="block text-slate-600">{step.busDetails.frequencyText} • ({step.busDetails.operatingHours})</span>
                        </div>
                      </div>

                      <div className="flex items-start gap-1.5">
                        <IndianRupee size={12} className="text-amber-600 shrink-0 mt-0.5" />
                        <div>
                          <strong className="text-slate-800">Fare &amp; Payment:</strong>
                          <span className="block text-slate-600">{step.busDetails.fareType}</span>
                        </div>
                      </div>

                      <div className="flex items-start gap-1.5">
                        <ShieldCheck size={12} className="text-amber-600 shrink-0 mt-0.5" />
                        <div>
                          <strong className="text-slate-800">Route Destination Board:</strong>
                          <span className="block text-slate-600">{step.busDetails.destinationBoardText}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* --- DETAILED LOCAL TRAIN CARD SNIPPET --- */}
                {step.trainDetails && (
                  <div className="bg-teal-50/60 border border-teal-100 rounded-transit p-2.5 text-[11px] space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-teal-900 flex items-center gap-1.5">
                        <Train size={13} className="text-transit-teal" />
                        <span>Suburban Rail Service ({step.trainDetails.serviceType})</span>
                      </span>
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-teal-100 text-teal-800">
                        {step.trainDetails.carCount} Rake
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-slate-600 text-[10px]">
                      <span>{step.trainDetails.platformHint}</span>
                      <span>•</span>
                      <span>Frequency: {step.trainDetails.frequencyText}</span>
                      <span>•</span>
                      <span>UTS Mobile QR / ATVM Smart Card</span>
                    </div>
                  </div>
                )}

                {step.transferWalkTimeMins && (
                  <div className="py-1 px-2 rounded bg-amber-50/70 border border-amber-100 text-amber-900 text-[11px] flex items-center gap-1">
                    <Clock size={11} />
                    <span>Transfer Walk: ~{step.transferWalkTimeMins} mins via interchange foot overbridge / skywalk</span>
                  </div>
                )}

                {step.intermediateStations && step.intermediateStations.length > 0 && (
                  <div className="text-[11px] text-slate-400">
                    <span className="italic">Intermediate stops: </span>
                    {step.intermediateStations.slice(0, 5).join(', ')}
                    {step.intermediateStations.length > 5 && ` +${step.intermediateStations.length - 5} more`}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

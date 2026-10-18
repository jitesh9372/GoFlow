import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { Locate, Map as MapIcon, Satellite, AlertCircle, Train, Bus, Navigation, Layers, Compass, Sparkles, Filter } from 'lucide-react';
import { Station, CrowdReading, TransportMode, RouteOption, TransitLine } from '../types';
import { getCrowdLevelInfo } from './CrowdBadge';

interface LeafletCrowdMapProps {
  stations: Station[];
  readings: CrowdReading[];
  lines?: TransitLine[];
  selectedRoute?: RouteOption | null;
  onSelectStationAsOrigin?: (station: Station) => void;
  onSelectStationAsDest?: (station: Station) => void;
  height?: string;
  defaultMode?: TransportMode | 'all';
}

type MapTileStyle = 'transit' | 'minimal' | 'satellite';

const MAP_TILES: Record<MapTileStyle, { url: string; attribution: string; maxZoom: number }> = {
  // Esri Light Gray Canvas: Ultra-clean, distraction-free backdrop for transit lines
  minimal: {
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}',
    attribution: 'Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ',
    maxZoom: 16
  },
  // OpenStreetMap: High-detail road and geographical network
  transit: {
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    maxZoom: 19
  },
  // Esri Satellite: High-resolution satellite imagery
  satellite: {
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: 'Tiles &copy; Esri &mdash; Earthstar Geographics',
    maxZoom: 18
  }
};

// Official transit line configuration with distinct colors and modes
export interface LineVisualConfig {
  id: string;
  name: string;
  code: string;
  color: string;
  mode: TransportMode;
  dashArray?: string;
  weight: number;
}

const LINE_CONFIG: Record<string, LineVisualConfig> = {
  'western-line':   { id: 'western-line',  name: 'Western Line',  code: 'WR',  color: '#0d9488', mode: 'train', weight: 4.5 },
  'central-line':   { id: 'central-line',  name: 'Central Line',  code: 'CR',  color: '#b91c1c', mode: 'train', weight: 4.5 },
  'harbour-line':   { id: 'harbour-line',  name: 'Harbour Line',  code: 'HR',  color: '#2563eb', mode: 'train', weight: 4.5 },
  'metro-line-1':   { id: 'metro-line-1',  name: 'Metro Line 1',  code: 'M1',  color: '#0284c7', mode: 'metro', weight: 4 },
  'metro-line-2a':  { id: 'metro-line-2a', name: 'Metro 2A',      code: 'M2A', color: '#d97706', mode: 'metro', weight: 4 },
  'metro-line-7':   { id: 'metro-line-7',  name: 'Metro Line 7',  code: 'M7',  color: '#e11d48', mode: 'metro', weight: 4 },
  'metro-line-3':   { id: 'metro-line-3',  name: 'Metro 3 Aqua',  code: 'M3',  color: '#06b6d4', mode: 'metro', weight: 4 },
  'bus-route-332':  { id: 'bus-route-332', name: 'BEST 332',      code: 'B332',color: '#ea580c', mode: 'bus',   weight: 3, dashArray: '6 4' },
  'bus-route-as4':  { id: 'bus-route-as4', name: 'BEST AS-4 AC',  code: 'AS-4',color: '#059669', mode: 'bus',   weight: 3, dashArray: '6 4' },
  'bus-route-c40':  { id: 'bus-route-c40', name: 'BEST C-40 Exp', code: 'C-40',color: '#7c3aed', mode: 'bus',   weight: 3, dashArray: '6 4' },
};

// Fallback line route sequence if lines are not provided via props
const STATIC_LINES: Array<{ id: string; mode: TransportMode; stationIds: string[] }> = [
  {
    id: 'western-line',
    mode: 'train',
    stationIds: [
      'stn-churchgate', 'stn-marine-lines', 'stn-charni-road', 'stn-grant-road',
      'stn-mumbai-central', 'stn-mahalaxmi', 'stn-lower-parel', 'stn-prabhadevi',
      'stn-dadar-wr', 'stn-matunga-road', 'stn-mahim', 'stn-bandra',
      'stn-khar-road', 'stn-santacruz', 'stn-vile-parle', 'stn-andheri',
      'stn-jogeshwari', 'stn-ram-mandir', 'stn-goregaon', 'stn-malad',
      'stn-kandivali', 'stn-borivali', 'stn-dahisar', 'stn-mira-road',
      'stn-bhayandar', 'stn-vasai-road', 'stn-virar'
    ]
  },
  {
    id: 'central-line',
    mode: 'train',
    stationIds: [
      'stn-csmt', 'stn-masjid', 'stn-sandhurst-road', 'stn-byculla',
      'stn-chinchpokli', 'stn-currey-road', 'stn-parel', 'stn-dadar-cr',
      'stn-matunga', 'stn-sion', 'stn-kurla', 'stn-vidyavihar',
      'stn-ghatkopar', 'stn-vikhroli', 'stn-kanjurmarg', 'stn-bhandup',
      'stn-nahur', 'stn-mulund', 'stn-thane', 'stn-kalva',
      'stn-mumbra', 'stn-diva', 'stn-dombivli', 'stn-kalyan'
    ]
  },
  {
    id: 'harbour-line',
    mode: 'train',
    stationIds: [
      'stn-csmt', 'stn-sandhurst-road', 'stn-wadala-road', 'stn-gtb-nagar',
      'stn-chunabhatti', 'stn-kurla', 'stn-tilak-nagar', 'stn-chembur',
      'stn-govandi', 'stn-mankhurd', 'stn-vashi', 'stn-sanpada',
      'stn-juinagar', 'stn-nerul', 'stn-seawoods', 'stn-belapur',
      'stn-kharghar', 'stn-panvel'
    ]
  },
  {
    id: 'metro-line-1',
    mode: 'metro',
    stationIds: [
      'stn-versova-metro', 'stn-dn-nagar-metro', 'stn-azad-nagar-metro',
      'stn-andheri-metro', 'stn-weh-metro', 'stn-chakala-metro',
      'stn-airport-road-metro', 'stn-marol-naka-metro', 'stn-saki-naka-metro',
      'stn-asalpha-metro', 'stn-jagruti-nagar-metro', 'stn-ghatkopar-metro'
    ]
  },
  {
    id: 'metro-line-2a',
    mode: 'metro',
    stationIds: [
      'stn-dahisar-e-metro', 'stn-anand-nagar-metro', 'stn-borivali-w-metro',
      'stn-kandivali-w-metro', 'stn-dahanukarwadi-metro', 'stn-malad-w-metro',
      'stn-goregaon-w-metro', 'stn-oshiwara-metro', 'stn-andheri-w-metro'
    ]
  },
  {
    id: 'metro-line-7',
    mode: 'metro',
    stationIds: [
      'stn-dahisar-e-metro', 'stn-national-park-metro', 'stn-magathane-metro',
      'stn-kurar-metro', 'stn-dindoshi-metro', 'stn-aarey-metro',
      'stn-jogeshwari-e-metro', 'stn-gundavali-metro'
    ]
  },
  {
    id: 'metro-line-3',
    mode: 'metro',
    stationIds: [
      'stn-aarey-jvlr-m3', 'stn-seepz-m3', 'stn-midc-m3',
      'stn-marol-naka-m3', 'stn-csmia-t2-m3', 'stn-sahar-road-m3',
      'stn-csmia-t1-m3', 'stn-santacruz-m3', 'stn-bkc-m3'
    ]
  },
  {
    id: 'bus-route-332',
    mode: 'bus',
    stationIds: [
      'stn-kurla', 'stn-bail-bazar-bus', 'stn-saki-naka-metro',
      'stn-marol-naka-metro', 'stn-andheri'
    ]
  },
  {
    id: 'bus-route-as4',
    mode: 'bus',
    stationIds: [
      'stn-borivali', 'stn-kandivali', 'stn-malad', 'stn-goregaon',
      'stn-andheri', 'stn-bkc-m3'
    ]
  },
  {
    id: 'bus-route-c40',
    mode: 'bus',
    stationIds: [
      'stn-dadar-cr', 'stn-byculla', 'stn-csmt', 'stn-churchgate'
    ]
  }
];

export const LeafletCrowdMap: React.FC<LeafletCrowdMapProps> = ({
  stations,
  readings,
  lines,
  selectedRoute = null,
  onSelectStationAsOrigin,
  onSelectStationAsDest,
  height = '600px',
  defaultMode = 'all'
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const linesLayerRef = useRef<L.LayerGroup | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const routeLayerRef = useRef<L.LayerGroup | null>(null);

  const [mapStyle, setMapStyle] = useState<MapTileStyle>('minimal');
  const [activeMode, setActiveMode] = useState<TransportMode | 'all'>(defaultMode);
  const [activeLineId, setActiveLineId] = useState<string | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [showLegend, setShowLegend] = useState(true);

  // Station ID lookups
  const stationMap = new Map(stations.map(s => [s.id, s]));
  const readingMap = new Map(readings.map(r => [r.stationId, r]));

  // Combine static and backend lines
  const activeLinesData = React.useMemo(() => {
    if (lines && lines.length > 0) {
      return lines.map(l => ({
        id: l.id,
        mode: l.mode,
        stationIds: l.stationIds
      }));
    }
    return STATIC_LINES;
  }, [lines]);

  // 1. Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [19.0800, 72.8800],
        zoom: 11,
        minZoom: 10,
        maxZoom: 18,
        zoomControl: false, // Custom position
        attributionControl: false
      });

      // Position zoom control cleanly in top-right
      L.control.zoom({ position: 'topright' }).addTo(map);

      // Attribution control in bottom-right
      L.control.attribution({ position: 'bottomright', prefix: false }).addTo(map);

      // Initial Base Tile Layer
      const tileConfig = MAP_TILES.minimal;
      const baseLayer = L.tileLayer(tileConfig.url, {
        attribution: tileConfig.attribution,
        maxZoom: tileConfig.maxZoom
      }).addTo(map);

      tileLayerRef.current = baseLayer;

      // Layer groups in strict render order: lines -> markers -> active route
      const linesGroup = L.layerGroup().addTo(map);
      const markersGroup = L.layerGroup().addTo(map);
      const routeGroup = L.layerGroup().addTo(map);

      linesLayerRef.current = linesGroup;
      markersLayerRef.current = markersGroup;
      routeLayerRef.current = routeGroup;
      mapInstanceRef.current = map;
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // 2. Base Tile Style Switch
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (tileLayerRef.current) {
      map.removeLayer(tileLayerRef.current);
    }

    const tileConfig = MAP_TILES[mapStyle];
    const newLayer = L.tileLayer(tileConfig.url, {
      attribution: tileConfig.attribution,
      maxZoom: tileConfig.maxZoom
    }).addTo(map);

    tileLayerRef.current = newLayer;
  }, [mapStyle]);

  // 3. Render Crisp Transit Line Polylines
  useEffect(() => {
    const map = mapInstanceRef.current;
    const linesGroup = linesLayerRef.current;
    if (!map || !linesGroup || stations.length === 0) return;

    linesGroup.clearLayers();

    activeLinesData.forEach((line) => {
      const cfg = LINE_CONFIG[line.id] || {
        id: line.id,
        name: line.id,
        code: line.id.substring(0, 3).toUpperCase(),
        color: line.mode === 'metro' ? '#0284c7' : line.mode === 'bus' ? '#ea580c' : '#0d9488',
        mode: line.mode,
        weight: line.mode === 'train' ? 4 : line.mode === 'metro' ? 3.5 : 2.5
      };

      // Filter by active transport mode
      if (activeMode !== 'all' && cfg.mode !== activeMode) return;

      // Filter by specific selected line
      const isLineFocused = activeLineId === null || activeLineId === line.id;
      const opacity = activeLineId === null ? (cfg.mode === 'bus' ? 0.75 : 0.9) : (activeLineId === line.id ? 1 : 0.2);

      // Build ordered coordinates
      const coords: L.LatLngExpression[] = [];
      line.stationIds.forEach(stnId => {
        const stn = stationMap.get(stnId);
        if (stn) coords.push([stn.latitude, stn.longitude]);
      });

      if (coords.length < 2) return;

      // Base line backing for high contrast
      if (cfg.mode !== 'bus' && isLineFocused) {
        L.polyline(coords, {
          color: '#ffffff',
          weight: cfg.weight + 2,
          opacity: 0.9,
          lineCap: 'round',
          lineJoin: 'round'
        }).addTo(linesGroup);
      }

      // Main colored polyline
      const poly = L.polyline(coords, {
        color: cfg.color,
        weight: isLineFocused && activeLineId === line.id ? cfg.weight + 2 : cfg.weight,
        opacity,
        dashArray: cfg.dashArray || undefined,
        lineCap: 'round',
        lineJoin: 'round'
      });

      // Hover tooltip
      poly.bindTooltip(
        `<div style="font-weight: 700; font-size: 11px; color: ${cfg.color}; font-family: Inter, sans-serif;">
          ${cfg.name} (${cfg.code})
        </div>`,
        {
          sticky: true,
          direction: 'top',
          className: 'transit-line-tooltip'
        }
      );

      poly.on('click', () => {
        setActiveLineId(prev => (prev === line.id ? null : line.id));
      });

      poly.addTo(linesGroup);
    });
  }, [stations, activeMode, activeLineId, activeLinesData]);

  // 4. Render Clean, Non-Congested Station Nodes
  useEffect(() => {
    const map = mapInstanceRef.current;
    const markersGroup = markersLayerRef.current;
    if (!map || !markersGroup || stations.length === 0) return;

    markersGroup.clearLayers();

    // Stations filtered by mode
    const filteredStations = stations.filter(s => {
      if (activeMode !== 'all' && s.mode !== activeMode) return false;
      if (activeLineId) {
        const line = activeLinesData.find(l => l.id === activeLineId);
        if (line && !line.stationIds.includes(s.id)) return false;
      }
      return true;
    });

    filteredStations.forEach((station) => {
      const reading = readingMap.get(station.id);
      const level = reading ? reading.crowdLevel : (station.isInterchange ? 'high' : 'medium');
      const info = getCrowdLevelInfo(level);
      const occupancy = reading?.occupancyPercentage ?? (level === 'high' ? 88 : level === 'medium' ? 60 : 30);
      const isLiveSource = reading?.source === 'live_sensor' || reading?.source === 'passenger_report';

      // Streamlined sizing: Small & elegant to avoid overlapping congestion
      const isInterchange = station.isInterchange;
      const radius = isInterchange ? 6 : 4;
      const diameter = radius * 2;

      // Mode-specific node geometry:
      // Train: circle
      // Metro: diamond (rotated square)
      // Bus: rounded square
      let shapeHtml = '';
      if (station.mode === 'metro') {
        shapeHtml = `
          <div style="
            width: ${diameter}px;
            height: ${diameter}px;
            background-color: ${info.hex};
            border: 1.5px solid #ffffff;
            transform: rotate(45deg);
            box-shadow: 0 1px 3px rgba(15,23,42,0.35);
          "></div>
        `;
      } else if (station.mode === 'bus') {
        shapeHtml = `
          <div style="
            width: ${diameter}px;
            height: ${diameter}px;
            background-color: ${info.hex};
            border: 1.5px solid #ffffff;
            border-radius: 2px;
            box-shadow: 0 1px 3px rgba(15,23,42,0.35);
          "></div>
        `;
      } else {
        // Local Train node
        shapeHtml = `
          <div style="
            width: ${diameter}px;
            height: ${diameter}px;
            background-color: ${info.hex};
            border: 1.5px solid #ffffff;
            border-radius: 50%;
            box-shadow: 0 1px 3px rgba(15,23,42,0.35);
          "></div>
        `;
      }

      // Subtle interchange hub outer ring
      const hubRingHtml = isInterchange ? `
        <div style="
          position: absolute;
          width: ${diameter + 8}px;
          height: ${diameter + 8}px;
          border: 1.5px dashed ${info.hex};
          border-radius: 50%;
          opacity: 0.65;
        "></div>
      ` : '';

      const livePulseHtml = isLiveSource && level === 'high' ? `
        <div style="
          position: absolute;
          width: ${diameter + 12}px;
          height: ${diameter + 12}px;
          border-radius: 50%;
          background: ${info.hex};
          opacity: 0.2;
        "></div>
      ` : '';

      const iconHtml = `
        <div style="
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          width: ${diameter + 14}px;
          height: ${diameter + 14}px;
          cursor: pointer;
        ">
          ${livePulseHtml}
          ${hubRingHtml}
          ${shapeHtml}
        </div>
      `;

      const customIcon = L.divIcon({
        html: iconHtml,
        className: 'station-clean-marker',
        iconSize: [diameter + 14, diameter + 14],
        iconAnchor: [(diameter + 14) / 2, (diameter + 14) / 2],
        popupAnchor: [0, -radius - 8]
      });

      const marker = L.marker([station.latitude, station.longitude], { icon: customIcon });

      // Clean tooltip on hover for instant readability without opening popup
      marker.bindTooltip(
        `<div style="font-family: Inter, system-ui, sans-serif; font-size: 11px; padding: 1px 2px;">
          <strong style="color: #0f172a;">${station.name}</strong>
          <span style="color: ${info.hex}; font-weight: 600; margin-left: 4px;">● ${occupancy}%</span>
        </div>`,
        { direction: 'top', offset: [0, -8], opacity: 0.95 }
      );

      // Detailed interactive popup
      const popupDiv = document.createElement('div');
      popupDiv.className = 'p-3 text-xs text-slate-800 min-w-[210px] font-sans';
      popupDiv.innerHTML = `
        <div style="display: flex; align-items: start; justify-content: space-between; border-bottom: 1px solid #e2e8f0; padding-bottom: 8px; margin-bottom: 8px;">
          <div>
            <h5 style="font-weight: 700; font-size: 13px; color: #0f172a; margin: 0 0 2px 0;">${station.name}</h5>
            ${station.marathiName ? `<p style="color: #64748b; font-size: 11px; margin: 0;">${station.marathiName}</p>` : ''}
          </div>
          <span style="font-family: monospace; font-size: 10px; padding: 2px 6px; background: #f1f5f9; border-radius: 4px; color: #475569; white-space: nowrap;">${station.code}</span>
        </div>

        <div style="display: flex; flex-direction: column; gap: 4px; margin-bottom: 10px;">
          <div style="display: flex; justify-content: space-between;">
            <span style="color: #64748b;">Transit Mode</span>
            <span style="font-weight: 600; text-transform: capitalize;">${
              station.mode === 'train' ? '🚂 Suburban Rail' : station.mode === 'metro' ? '🚇 Mumbai Metro' : '🚌 BEST Bus'
            }</span>
          </div>
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span style="color: #64748b;">Live Crowd</span>
            <span style="font-weight: 700; color: ${info.hex};">● ${info.label} (${occupancy}%)</span>
          </div>
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span style="color: #64748b;">Data Status</span>
            <span style="font-weight: 500; display: flex; align-items: center; gap: 4px; font-size: 11px;">
              ${isLiveSource ? '<span style="width: 6px; height: 6px; border-radius: 50%; background: #10b981; display: inline-block;"></span> Active Stream' : 'Historical Benchmark'}
            </span>
          </div>
          ${station.isInterchange ? `
            <div style="margin-top: 4px; background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 4px; padding: 4px 8px; font-size: 11px; color: #166534; font-weight: 600;">
              ⚡ Major Multi-Line Interchange
            </div>
          ` : ''}
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 6px;">
          <button id="btn-origin-${station.id}" style="padding: 6px 8px; border: 1px solid #cbd5e1; border-radius: 5px; background: #f8fafc; font-size: 11px; font-weight: 600; cursor: pointer; color: #334155; transition: background 0.15s ease;">
            Plan From
          </button>
          <button id="btn-dest-${station.id}" style="padding: 6px 8px; border: none; border-radius: 5px; background: #0f766e; color: white; font-size: 11px; font-weight: 600; cursor: pointer; transition: background 0.15s ease;">
            Plan To
          </button>
        </div>
      `;

      marker.bindPopup(popupDiv, { maxWidth: 260 });

      marker.on('popupopen', () => {
        document.getElementById(`btn-origin-${station.id}`)?.addEventListener('click', () => {
          onSelectStationAsOrigin?.(station);
          marker.closePopup();
        });
        document.getElementById(`btn-dest-${station.id}`)?.addEventListener('click', () => {
          onSelectStationAsDest?.(station);
          marker.closePopup();
        });
      });

      marker.addTo(markersGroup);
    });
  }, [stations, readings, activeMode, activeLineId, activeLinesData]);

  // 5. Render Active Route Polyline (Highlighted on Top)
  useEffect(() => {
    const map = mapInstanceRef.current;
    const routeGroup = routeLayerRef.current;
    if (!map || !routeGroup) return;

    routeGroup.clearLayers();
    if (!selectedRoute || selectedRoute.steps.length === 0) return;

    const allStepCoords: L.LatLngExpression[] = [];

    selectedRoute.steps.forEach((step) => {
      const stepCoords: L.LatLngExpression[] = [];
      const fromStn = stationMap.get(step.fromStationId);
      const toStn = stationMap.get(step.toStationId);

      if (fromStn) {
        stepCoords.push([fromStn.latitude, fromStn.longitude]);
        allStepCoords.push([fromStn.latitude, fromStn.longitude]);
      }

      step.intermediateStations.forEach(name => {
        const match = stations.find(s => s.name === name);
        if (match) {
          stepCoords.push([match.latitude, match.longitude]);
          allStepCoords.push([match.latitude, match.longitude]);
        }
      });

      if (toStn) {
        stepCoords.push([toStn.latitude, toStn.longitude]);
        allStepCoords.push([toStn.latitude, toStn.longitude]);
      }

      if (stepCoords.length >= 2) {
        // Ambient white glow aura
        L.polyline(stepCoords, {
          color: '#ffffff',
          weight: 10,
          opacity: 0.8,
          lineCap: 'round',
          lineJoin: 'round'
        }).addTo(routeGroup);

        // Dark accent boundary
        L.polyline(stepCoords, {
          color: '#0f172a',
          weight: 7,
          opacity: 0.9,
          lineCap: 'round',
          lineJoin: 'round'
        }).addTo(routeGroup);

        // Core vivid route color
        L.polyline(stepCoords, {
          color: step.lineColor || '#0d9488',
          weight: 5,
          opacity: 1,
          dashArray: step.mode === 'bus' ? '8 5' : undefined,
          lineCap: 'round',
          lineJoin: 'round'
        }).addTo(routeGroup);
      }
    });

    if (allStepCoords.length >= 2) {
      const bounds = L.latLngBounds(allStepCoords);
      map.fitBounds(bounds, { padding: [60, 60], maxZoom: 14 });
    }
  }, [selectedRoute, stations]);

  // 6. User Geolocation
  const handleLocateMe = () => {
    setLocationError(null);
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by your browser.');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        if (mapInstanceRef.current) {
          mapInstanceRef.current.setView([latitude, longitude], 14);
          L.circleMarker([latitude, longitude], {
            radius: 7,
            fillColor: '#0f766e',
            color: '#ffffff',
            weight: 2.5,
            opacity: 1,
            fillOpacity: 0.9
          })
            .bindPopup('<strong style="font-size:11px;">📍 Your Current Location</strong>')
            .addTo(mapInstanceRef.current)
            .openPopup();
        }
      },
      (err) => {
        setLocationError(
          err.code === 1 ? 'Location permission was denied.' : 'Unable to determine current position.'
        );
      },
      { timeout: 8000 }
    );
  };

  // Visible lines in the legend
  const visibleLines = Object.values(LINE_CONFIG).filter(
    cfg => activeMode === 'all' || cfg.mode === activeMode
  );

  return (
    <div className="relative w-full rounded-2xl overflow-hidden border border-slate-200 shadow-sm bg-slate-100 flex flex-col">

      {/* ── Top Floating Navigation & Controls Bar (High Z-Index for interactivity) ── */}
      <div className="absolute z-[1000] top-3 left-3 right-3 flex flex-wrap items-center justify-between gap-2 pointer-events-none">

        {/* Left: Mode Filtering Pills */}
        <div className="inline-flex items-center gap-1 bg-white/95 backdrop-blur-md p-1 rounded-xl border border-slate-200/90 shadow-sm pointer-events-auto text-xs">
          {[
            { key: 'all',   label: `All Modes (${stations.length})` },
            { key: 'train', label: '🚂 Local Trains' },
            { key: 'metro', label: '🚇 Metro' },
            { key: 'bus',   label: '🚌 BEST Bus' },
          ].map(({ key, label }) => (
            <button
              key={key}
              id={`filter-mode-${key}`}
              type="button"
              onClick={() => {
                setActiveMode(key as TransportMode | 'all');
                setActiveLineId(null);
              }}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                activeMode === key
                  ? 'bg-teal-700 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Right: Map Style + Locate Me Controls */}
        <div className="flex items-center gap-2 pointer-events-auto">
          {/* Base Layer Switcher */}
          <div className="inline-flex items-center rounded-xl bg-white/95 backdrop-blur-md p-0.5 border border-slate-200/90 shadow-sm text-xs font-semibold">
            <button
              id="btn-style-transit"
              type="button"
              onClick={() => setMapStyle('transit')}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg transition-colors ${
                mapStyle === 'transit' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Compass size={12} />
              <span>Transit</span>
            </button>
            <button
              id="btn-style-minimal"
              type="button"
              onClick={() => setMapStyle('minimal')}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg transition-colors ${
                mapStyle === 'minimal' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <MapIcon size={12} />
              <span>Minimal</span>
            </button>
            <button
              id="btn-style-satellite"
              type="button"
              onClick={() => setMapStyle('satellite')}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg transition-colors ${
                mapStyle === 'satellite' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Satellite size={12} />
              <span>Satellite</span>
            </button>
          </div>

          {/* Locate GPS */}
          <button
            id="btn-locate-me"
            type="button"
            onClick={handleLocateMe}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white/95 backdrop-blur-md hover:bg-white text-slate-700 text-xs font-semibold rounded-xl border border-slate-200/90 shadow-sm transition-all active:scale-95"
            title="Locate my position on map"
          >
            <Locate size={13} className="text-teal-700" />
            <span className="hidden sm:inline">Locate</span>
          </button>
        </div>
      </div>

      {/* ── Geolocation Notice ── */}
      {locationError && (
        <div className="absolute z-[1000] top-16 left-3 right-3 bg-amber-50/95 border border-amber-200 text-amber-900 text-xs p-2.5 rounded-xl flex items-center justify-between gap-2 shadow-sm pointer-events-auto">
          <div className="flex items-center gap-2">
            <AlertCircle size={14} className="shrink-0 text-amber-600" />
            <span>{locationError}</span>
          </div>
          <button
            type="button"
            onClick={() => setLocationError(null)}
            className="text-[11px] underline font-medium text-amber-800"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* ── Line Focus Banner (If individual line clicked) ── */}
      {activeLineId && (
        <div className="absolute z-[1000] top-16 left-3 inline-flex items-center gap-2 bg-slate-900/90 text-white text-xs px-3 py-1.5 rounded-xl shadow-md pointer-events-auto backdrop-blur-sm">
          <span>Filtering by <strong>{LINE_CONFIG[activeLineId]?.name || activeLineId}</strong></span>
          <button
            type="button"
            onClick={() => setActiveLineId(null)}
            className="bg-white/20 hover:bg-white/30 text-white text-[10px] px-2 py-0.5 rounded font-medium ml-1"
          >
            Show All Lines
          </button>
        </div>
      )}

      {/* ── Bottom Interactive Legend (Clean & Non-Congested) ── */}
      <div className="absolute z-[1000] bottom-3 left-3 right-3 pointer-events-none">
        <div className="bg-white/95 backdrop-blur-md px-3.5 py-2.5 rounded-xl border border-slate-200/90 shadow-sm pointer-events-auto">
          <div className="flex flex-wrap items-center justify-between gap-2">

            {/* Left: Interactive Line Pills */}
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider pr-1 mr-0.5">
                Lines:
              </span>
              {visibleLines.map((cfg) => {
                const isSelected = activeLineId === cfg.id;
                return (
                  <button
                    key={cfg.id}
                    type="button"
                    onClick={() => setActiveLineId(prev => (prev === cfg.id ? null : cfg.id))}
                    className={`flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-medium border transition-all ${
                      isSelected
                        ? 'border-slate-800 bg-slate-800 text-white shadow-xs'
                        : 'border-slate-200 bg-slate-50/80 text-slate-700 hover:bg-slate-100 hover:border-slate-300'
                    }`}
                    title={`Click to isolate ${cfg.name}`}
                  >
                    <span
                      style={{ backgroundColor: cfg.color }}
                      className="w-2.5 h-2.5 rounded-full inline-block shrink-0"
                    />
                    <span>{cfg.code}</span>
                  </button>
                );
              })}
            </div>

            {/* Right: Crowd Density & Node Key */}
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-slate-600 border-t sm:border-t-0 sm:border-l border-slate-200 pt-1.5 sm:pt-0 sm:pl-3">
              <div className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
                <span className="text-slate-600 text-[10px]">Comfortable</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-amber-500 inline-block" />
                <span className="text-slate-600 text-[10px]">Moderate</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-rose-500 inline-block" />
                <span className="text-slate-600 text-[10px]">Dense SDCL</span>
              </div>
              <div className="hidden md:flex items-center gap-2 text-[10px] text-slate-400 pl-1 border-l border-slate-200">
                <span>● Rail</span>
                <span>◆ Metro</span>
                <span>■ Bus</span>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* ── Leaflet Map Container ── */}
      <div
        ref={mapContainerRef}
        style={{ height }}
        className="w-full z-0"
      />
    </div>
  );
};

export type TransportMode = 'train' | 'metro' | 'bus';

export type CrowdLevel = 'low' | 'medium' | 'high';

export type CrowdSource = 
  | 'live_sensor' 
  | 'verified_survey' 
  | 'passenger_report' 
  | 'historical_pattern' 
  | 'predicted';

export type CoachType = 'general' | 'ladies' | 'first_class' | 'ac' | 'all';

export type UserRole = 'admin' | 'passenger';

export interface Station {
  id: string;
  name: string;
  marathiName?: string;
  code: string;
  mode: TransportMode;
  lineIds: string[];
  latitude: number;
  longitude: number;
  zone?: string;
  isInterchange: boolean;
  interchangeLines?: string[];
  facilities?: string[];
  averageDailyFootfall?: number;
}

export interface TransitLine {
  id: string;
  name: string;
  mode: TransportMode;
  code: string;
  color: string;
  textColor: string;
  operator: string; // 'Central Railway' | 'Western Railway' | 'MMRDA' | 'BEST'
  terminalA: string;
  terminalB: string;
  stationIds: string[];
  totalDistanceKm: number;
  averageFrequencyMins: number;
  operatingHours: {
    start: string;
    end: string;
  };
}

export interface CrowdReading {
  id: string;
  stationId: string;
  stationName: string;
  lineId?: string;
  mode: TransportMode;
  crowdLevel: CrowdLevel;
  occupancyPercentage: number;
  source: CrowdSource;
  timestamp: string;
  coachType?: CoachType;
  direction?: 'UP' | 'DOWN' | 'BOTH';
  verified: boolean;
}

export interface CrowdReport {
  id: string;
  userId: string;
  userEmail: string;
  userName: string;
  stationId: string;
  stationName: string;
  mode: TransportMode;
  lineId?: string;
  crowdLevel: CrowdLevel;
  coachType?: CoachType;
  direction?: string;
  notes?: string;
  status: 'pending' | 'verified' | 'rejected';
  timestamp: string;
  verifiedAt?: string;
  verifiedBy?: string;
  reviewNotes?: string;
}

export interface MetroDetails {
  lineCode: string;
  lineName: string;
  operator: string;
  platformOrGate?: string;
  frequencyMins: number;
  frequencyText: string;
  isAirConditioned: boolean;
  ticketingOptions: string[];
  interchangeFOB?: string;
  operatingHours?: string;
}

export interface BestBusDetails {
  busRouteNumber: string;
  busType: 'Electric AC' | 'AC Express' | 'Ordinary Non-AC' | 'Double Decker AC';
  operator: string;
  boardingStop: string;
  alightingStop: string;
  frequencyMins: number;
  frequencyText: string;
  operatingHours: string;
  fareType: string;
  destinationBoardText: string;
}

export interface LocalTrainDetails {
  serviceType: 'Fast Local' | 'Slow Local' | 'Semi-Fast' | 'AC Local';
  carCount: '12-car' | '15-car';
  operator: string;
  platformHint?: string;
  frequencyText: string;
  ticketingOptions: string[];
}

export interface TransitConnections {
  originMetroStations?: Array<{ name: string; lineName: string; lineCode: string; distanceWalkMins: number }>;
  originBestBuses?: Array<{ routeNumber: string; destination: string; frequency: string; busType: string; stopName: string }>;
  destinationMetroStations?: Array<{ name: string; lineName: string; lineCode: string; distanceWalkMins: number }>;
  destinationBestBuses?: Array<{ routeNumber: string; destination: string; frequency: string; busType: string; stopName: string }>;
}

export interface RouteStep {
  stepIndex: number;
  mode: TransportMode;
  lineId?: string;
  lineName: string;
  lineColor: string;
  fromStationId: string;
  fromStationName: string;
  toStationId: string;
  toStationName: string;
  stopsCount: number;
  durationMins: number;
  crowdLevel: CrowdLevel;
  crowdSource: CrowdSource;
  transferWalkTimeMins?: number;
  intermediateStations: string[];
  instructions: string;
  metroDetails?: MetroDetails;
  busDetails?: BestBusDetails;
  trainDetails?: LocalTrainDetails;
}

export interface RouteOption {
  id: string;
  title: string;
  subtitle: string;
  totalDurationMins: number;
  totalTransfers: number;
  modes: TransportMode[];
  overallCrowd: CrowdLevel;
  crowdScore: number; // 0 - 100
  estimatedFareRupees: number;
  steps: RouteStep[];
  highlights: string[];
  recommendedCoach?: string;
  transitConnections?: TransitConnections;
}

export interface TransitNotification {
  id: string;
  title: string;
  message: string;
  severity: 'info' | 'warning' | 'alert';
  mode?: TransportMode;
  lineId?: string;
  affectedStations?: string[];
  createdAt: string;
  expiresAt?: string;
  active: boolean;
  authorName: string;
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  role: UserRole;
  createdAt: string;
  photoURL?: string;
  phone?: string;
  homeStation?: string;
  primaryCorridor?: string;
  savedRoutes?: Array<{
    id: string;
    fromStationId: string;
    fromStationName: string;
    toStationId: string;
    toStationName: string;
    preferredMode?: TransportMode;
    savedAt: string;
  }>;
}

export interface CrowdAnalytics {
  peakHours: {
    morning: { start: string; end: string; avgCrowd: CrowdLevel };
    evening: { start: string; end: string; avgCrowd: CrowdLevel };
  };
  hourlyDistribution: Array<{
    hour: string;
    trainCrowd: number;
    metroCrowd: number;
    busCrowd: number;
    overallLevel: CrowdLevel;
  }>;
  stationRankings: Array<{
    stationId: string;
    stationName: string;
    mode: TransportMode;
    crowdLevel: CrowdLevel;
    currentLoad: number;
    reportedCrowd: number;
  }>;
}

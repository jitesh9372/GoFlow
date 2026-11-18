import {
  Station,
  TransitLine,
  CrowdReading,
  CrowdReport,
  TransitNotification,
  UserProfile,
  CrowdAnalytics,
  CrowdLevel
} from '../types/index.js';
import {
  transitLines as initialLines,
  stations as initialStations,
  initialCrowdReadings,
  initialCrowdReports,
  initialNotifications
} from '../data/mumbaiTransitData.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { isFirebaseConfigured, getFirestore } from '../config/firebase.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const getProfileCachePath = () => path.resolve(__dirname, '../data/profiles_cache.json');

class TransitStore {
  private lines: Map<string, TransitLine> = new Map();
  private stations: Map<string, Station> = new Map();
  private crowdReadings: Map<string, CrowdReading> = new Map();
  private crowdReports: Map<string, CrowdReport> = new Map();
  private notifications: Map<string, TransitNotification> = new Map();
  private profiles: Map<string, UserProfile> = new Map();

  constructor() {
    this.seedLocalData();
  }

  private seedLocalData() {
    initialLines.forEach(l => this.lines.set(l.id, { ...l }));
    initialStations.forEach(s => this.stations.set(s.id, { ...s }));
    initialCrowdReadings.forEach(r => this.crowdReadings.set(r.id, { ...r }));
    initialCrowdReports.forEach(r => this.crowdReports.set(r.id, { ...r }));
    initialNotifications.forEach(n => this.notifications.set(n.id, { ...n }));

    // Demo Admin & Passenger profiles for out-of-the-box testing
    this.profiles.set('admin-1', {
      uid: 'admin-1',
      email: 'admin@123',
      displayName: 'Mumbai Transit Control Admin',
      role: 'admin',
      createdAt: new Date().toISOString()
    });

    this.profiles.set('admin-goflow-master', {
      uid: 'admin-goflow-master',
      email: 'admin@gmail.com',
      displayName: 'Mumbai Transit Control Admin',
      role: 'admin',
      createdAt: new Date().toISOString()
    });

    this.profiles.set('passenger-1', {
      uid: 'passenger-1',
      email: 'passenger@goflow.mumbai',
      displayName: 'Daily Mumbai Commuter',
      role: 'passenger',
      createdAt: new Date().toISOString(),
      savedRoutes: [
        {
          id: 'sr-1',
          fromStationId: 'stn-borivali',
          fromStationName: 'Borivali',
          toStationId: 'stn-churchgate',
          toStationName: 'Churchgate',
          preferredMode: 'train',
          savedAt: new Date().toISOString()
        },
        {
          id: 'sr-2',
          fromStationId: 'stn-thane',
          fromStationName: 'Thane',
          toStationId: 'stn-dadar-cr',
          toStationName: 'Dadar (Central)',
          preferredMode: 'train',
          savedAt: new Date().toISOString()
        }
      ]
    });

    // Load any previously persisted profiles from disk
    try {
      const cachePath = getProfileCachePath();
      if (fs.existsSync(cachePath)) {
        const raw = fs.readFileSync(cachePath, 'utf8');
        const list: UserProfile[] = JSON.parse(raw);
        if (Array.isArray(list)) {
          list.forEach(p => {
            if (p && p.uid) this.profiles.set(p.uid, p);
          });
        }
      }
    } catch (e) {
      // ignore
    }
  }

  // --- Lines ---
  async getLines(): Promise<TransitLine[]> {
    if (isFirebaseConfigured()) {
      try {
        const snap = await getFirestore()!.collection('lines').get();
        if (!snap.empty) {
          return snap.docs.map(doc => doc.data() as TransitLine);
        }
      } catch (err) {
        console.warn('[Firestore] Error fetching lines, falling back to cache:', err);
      }
    }
    return Array.from(this.lines.values());
  }

  async getLineById(id: string): Promise<TransitLine | undefined> {
    return this.lines.get(id);
  }

  async createLine(line: TransitLine): Promise<TransitLine> {
    this.lines.set(line.id, line);
    if (isFirebaseConfigured()) {
      try {
        await getFirestore()!.collection('lines').doc(line.id).set(line);
      } catch (err) {
        console.error('[Firestore] Error saving line:', err);
      }
    }
    return line;
  }

  async updateLine(id: string, updates: Partial<TransitLine>): Promise<TransitLine | null> {
    const existing = this.lines.get(id);
    if (!existing) return null;
    const updated = { ...existing, ...updates };
    this.lines.set(id, updated);
    if (isFirebaseConfigured()) {
      try {
        await getFirestore()!.collection('lines').doc(id).set(updated, { merge: true });
      } catch (err) {
        console.error('[Firestore] Error updating line:', err);
      }
    }
    return updated;
  }

  async deleteLine(id: string): Promise<boolean> {
    const deleted = this.lines.delete(id);
    if (isFirebaseConfigured()) {
      try {
        await getFirestore()!.collection('lines').doc(id).delete();
      } catch (err) {
        console.error('[Firestore] Error deleting line:', err);
      }
    }
    return deleted;
  }

  // --- Stations ---
  async getStations(): Promise<Station[]> {
    if (isFirebaseConfigured()) {
      try {
        const snap = await getFirestore()!.collection('stations').get();
        if (!snap.empty) {
          return snap.docs.map(doc => doc.data() as Station);
        }
      } catch (err) {
        console.warn('[Firestore] Error fetching stations, falling back to cache:', err);
      }
    }
    return Array.from(this.stations.values());
  }

  async getStationById(id: string): Promise<Station | undefined> {
    return this.stations.get(id);
  }

  async createStation(station: Station): Promise<Station> {
    this.stations.set(station.id, station);
    if (isFirebaseConfigured()) {
      try {
        await getFirestore()!.collection('stations').doc(station.id).set(station);
      } catch (err) {
        console.error('[Firestore] Error saving station:', err);
      }
    }
    return station;
  }

  async updateStation(id: string, updates: Partial<Station>): Promise<Station | null> {
    const existing = this.stations.get(id);
    if (!existing) return null;
    const updated = { ...existing, ...updates };
    this.stations.set(id, updated);
    if (isFirebaseConfigured()) {
      try {
        await getFirestore()!.collection('stations').doc(id).set(updated, { merge: true });
      } catch (err) {
        console.error('[Firestore] Error updating station:', err);
      }
    }
    return updated;
  }

  async deleteStation(id: string): Promise<boolean> {
    const deleted = this.stations.delete(id);
    if (isFirebaseConfigured()) {
      try {
        await getFirestore()!.collection('stations').doc(id).delete();
      } catch (err) {
        console.error('[Firestore] Error deleting station:', err);
      }
    }
    return deleted;
  }

  // --- Crowd Readings ---
  async getCrowdReadings(filters?: {
    stationId?: string;
    lineId?: string;
    mode?: string;
    crowdLevel?: string;
  }): Promise<CrowdReading[]> {
    let list = Array.from(this.crowdReadings.values());
    if (filters?.stationId) list = list.filter(r => r.stationId === filters.stationId);
    if (filters?.lineId) list = list.filter(r => r.lineId === filters.lineId);
    if (filters?.mode) list = list.filter(r => r.mode === filters.mode);
    if (filters?.crowdLevel) list = list.filter(r => r.crowdLevel === filters.crowdLevel);
    // Sort latest first
    return list.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  async addCrowdReading(reading: Omit<CrowdReading, 'id'>): Promise<CrowdReading> {
    const id = `cr-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const newReading: CrowdReading = { id, ...reading };
    this.crowdReadings.set(id, newReading);
    if (isFirebaseConfigured()) {
      try {
        await getFirestore()!.collection('crowdReadings').doc(id).set(newReading);
      } catch (err) {
        console.error('[Firestore] Error adding crowd reading:', err);
      }
    }
    return newReading;
  }

  // --- Crowd Reports ---
  async getCrowdReports(status?: 'pending' | 'verified' | 'rejected'): Promise<CrowdReport[]> {
    let list = Array.from(this.crowdReports.values());
    if (status) list = list.filter(r => r.status === status);
    return list.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  async addCrowdReport(report: Omit<CrowdReport, 'id' | 'status' | 'timestamp'>): Promise<CrowdReport> {
    const id = `rep-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const newReport: CrowdReport = {
      id,
      ...report,
      status: 'pending',
      timestamp: new Date().toISOString()
    };
    this.crowdReports.set(id, newReport);
    if (isFirebaseConfigured()) {
      try {
        await getFirestore()!.collection('crowdReports').doc(id).set(newReport);
      } catch (err) {
        console.error('[Firestore] Error adding report:', err);
      }
    }
    return newReport;
  }

  async reviewCrowdReport(
    id: string,
    status: 'verified' | 'rejected',
    verifiedBy: string,
    reviewNotes?: string
  ): Promise<CrowdReport | null> {
    const existing = this.crowdReports.get(id);
    if (!existing) return null;
    const updated: CrowdReport = {
      ...existing,
      status,
      verifiedBy,
      verifiedAt: new Date().toISOString(),
      reviewNotes: reviewNotes || existing.reviewNotes
    };
    this.crowdReports.set(id, updated);

    // If verified, generate a verified crowd reading for the station
    if (status === 'verified') {
      const occupancy = updated.crowdLevel === 'high' ? 85 : updated.crowdLevel === 'medium' ? 60 : 30;
      await this.addCrowdReading({
        stationId: updated.stationId,
        stationName: updated.stationName,
        lineId: updated.lineId,
        mode: updated.mode,
        crowdLevel: updated.crowdLevel,
        occupancyPercentage: occupancy,
        source: 'passenger_report',
        timestamp: new Date().toISOString(),
        coachType: updated.coachType,
        verified: true
      });
    }

    if (isFirebaseConfigured()) {
      try {
        await getFirestore()!.collection('crowdReports').doc(id).set(updated, { merge: true });
      } catch (err) {
        console.error('[Firestore] Error reviewing report:', err);
      }
    }
    return updated;
  }

  // --- Notifications ---
  async getNotifications(onlyActive = true): Promise<TransitNotification[]> {
    let list = Array.from(this.notifications.values());
    if (onlyActive) list = list.filter(n => n.active);
    return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async createNotification(notif: Omit<TransitNotification, 'id' | 'createdAt' | 'active'>): Promise<TransitNotification> {
    const id = `notif-${Date.now()}`;
    const newNotif: TransitNotification = {
      id,
      ...notif,
      createdAt: new Date().toISOString(),
      active: true
    };
    this.notifications.set(id, newNotif);
    if (isFirebaseConfigured()) {
      try {
        await getFirestore()!.collection('notifications').doc(id).set(newNotif);
      } catch (err) {
        console.error('[Firestore] Error saving notification:', err);
      }
    }
    return newNotif;
  }

  async dismissNotification(id: string): Promise<boolean> {
    const existing = this.notifications.get(id);
    if (!existing) return false;
    existing.active = false;
    this.notifications.set(id, existing);
    if (isFirebaseConfigured()) {
      try {
        await getFirestore()!.collection('notifications').doc(id).update({ active: false });
      } catch (err) {
        console.error('[Firestore] Error dismissing notification:', err);
      }
    }
    return true;
  }

  // --- Profiles & Saved Routes ---
  async getProfile(uid: string): Promise<UserProfile | null> {
    if (isFirebaseConfigured()) {
      try {
        const doc = await getFirestore()!.collection('profiles').doc(uid).get();
        if (doc.exists) return doc.data() as UserProfile;
      } catch (err) {
        console.warn('[Firestore] Error getting profile:', err);
      }
    }
    return this.profiles.get(uid) || null;
  }

  async getProfileByEmail(email: string): Promise<UserProfile | null> {
    const targetEmail = email.trim().toLowerCase();
    if (isFirebaseConfigured()) {
      try {
        const snap = await getFirestore()!.collection('profiles').where('email', '==', targetEmail).limit(1).get();
        if (!snap.empty) {
          return snap.docs[0].data() as UserProfile;
        }
      } catch (err) {
        console.warn('[Firestore] Error getting profile by email:', err);
      }
    }
    for (const p of this.profiles.values()) {
      if (p.email.trim().toLowerCase() === targetEmail) {
        return p;
      }
    }
    return null;
  }

  async setProfile(profile: UserProfile): Promise<UserProfile> {
    this.profiles.set(profile.uid, profile);
    try {
      const cachePath = getProfileCachePath();
      fs.writeFileSync(cachePath, JSON.stringify(Array.from(this.profiles.values()), null, 2), 'utf8');
    } catch (e) {
      // ignore
    }
    if (isFirebaseConfigured()) {
      try {
        await getFirestore()!.collection('profiles').doc(profile.uid).set(profile, { merge: true });
      } catch (err) {
        console.error('[Firestore] Error saving profile:', err);
      }
    }
    return profile;
  }

  async saveRoute(uid: string, route: {
    fromStationId: string;
    fromStationName: string;
    toStationId: string;
    toStationName: string;
    preferredMode?: any;
  }): Promise<UserProfile | null> {
    const profile = await this.getProfile(uid);
    if (!profile) return null;
    const currentSaved = profile.savedRoutes || [];
    const newRoute = {
      id: `sr-${Date.now()}`,
      ...route,
      savedAt: new Date().toISOString()
    };
    const updated: UserProfile = {
      ...profile,
      savedRoutes: [...currentSaved, newRoute]
    };
    await this.setProfile(updated);
    return updated;
  }

  async deleteSavedRoute(uid: string, routeId: string): Promise<UserProfile | null> {
    const profile = await this.getProfile(uid);
    if (!profile) return null;
    const updated: UserProfile = {
      ...profile,
      savedRoutes: (profile.savedRoutes || []).filter(r => r.id !== routeId)
    };
    await this.setProfile(updated);
    return updated;
  }

  // --- Analytics ---
  getAnalytics(): CrowdAnalytics {
    const hours = [
      '06:00', '07:00', '08:00', '09:00', '10:00', '11:00',
      '12:00', '13:00', '14:00', '15:00', '16:00', '17:00',
      '18:00', '19:00', '20:00', '21:00', '22:00', '23:00'
    ];

    const hourlyDistribution = hours.map(hour => {
      const h = parseInt(hour.split(':')[0], 10);
      let trainCrowd = 40;
      let metroCrowd = 35;
      let busCrowd = 45;

      // Realistic Mumbai Peak Hours:
      // Morning rush: 08:00 - 11:00
      // Evening rush: 17:30 - 20:30
      if (h >= 8 && h <= 10) {
        trainCrowd = 94; // Super Dense Crush Load (SDCL)
        metroCrowd = 78;
        busCrowd = 82;
      } else if (h >= 17 && h <= 20) {
        trainCrowd = 96; // Super Dense Crush Load
        metroCrowd = 84;
        busCrowd = 86;
      } else if (h >= 12 && h <= 15) {
        trainCrowd = 38;
        metroCrowd = 42;
        busCrowd = 40;
      }

      const avg = (trainCrowd + metroCrowd + busCrowd) / 3;
      const overallLevel: CrowdLevel = avg > 75 ? 'high' : avg > 45 ? 'medium' : 'low';

      return {
        hour,
        trainCrowd,
        metroCrowd,
        busCrowd,
        overallLevel
      };
    });

    const stationRankings = [
      { stationId: 'stn-dadar-wr', stationName: 'Dadar (Western & Central)', mode: 'train' as const, crowdLevel: 'high' as const, currentLoad: 94, reportedCrowd: 142 },
      { stationId: 'stn-andheri', stationName: 'Andheri (WR & Metro 1)', mode: 'train' as const, crowdLevel: 'high' as const, currentLoad: 92, reportedCrowd: 135 },
      { stationId: 'stn-ghatkopar', stationName: 'Ghatkopar (CR & Metro 1)', mode: 'train' as const, crowdLevel: 'high' as const, currentLoad: 90, reportedCrowd: 118 },
      { stationId: 'stn-kurla', stationName: 'Kurla Junction (CR & Harbour)', mode: 'train' as const, crowdLevel: 'high' as const, currentLoad: 88, reportedCrowd: 96 },
      { stationId: 'stn-thane', stationName: 'Thane (Central Main Line)', mode: 'train' as const, crowdLevel: 'medium' as const, currentLoad: 72, reportedCrowd: 84 },
      { stationId: 'stn-borivali', stationName: 'Borivali (Western Line)', mode: 'train' as const, crowdLevel: 'medium' as const, currentLoad: 68, reportedCrowd: 79 },
      { stationId: 'stn-csmt', stationName: 'CSMT (South Terminus)', mode: 'train' as const, crowdLevel: 'medium' as const, currentLoad: 58, reportedCrowd: 52 },
      { stationId: 'stn-bkc-m3', stationName: 'BKC (Aqua Line 3 & Feeders)', mode: 'metro' as const, crowdLevel: 'low' as const, currentLoad: 35, reportedCrowd: 28 },
    ];

    return {
      peakHours: {
        morning: { start: '08:15 AM', end: '11:00 AM', avgCrowd: 'high' },
        evening: { start: '05:30 PM', end: '08:45 PM', avgCrowd: 'high' }
      },
      hourlyDistribution,
      stationRankings
    };
  }
}

export const store = new TransitStore();

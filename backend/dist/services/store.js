"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.store = void 0;
const mumbaiTransitData_js_1 = require("../data/mumbaiTransitData.js");
const firebase_js_1 = require("../config/firebase.js");
class TransitStore {
    lines = new Map();
    stations = new Map();
    crowdReadings = new Map();
    crowdReports = new Map();
    notifications = new Map();
    profiles = new Map();
    constructor() {
        this.seedLocalData();
    }
    seedLocalData() {
        mumbaiTransitData_js_1.transitLines.forEach(l => this.lines.set(l.id, { ...l }));
        mumbaiTransitData_js_1.stations.forEach(s => this.stations.set(s.id, { ...s }));
        mumbaiTransitData_js_1.initialCrowdReadings.forEach(r => this.crowdReadings.set(r.id, { ...r }));
        mumbaiTransitData_js_1.initialCrowdReports.forEach(r => this.crowdReports.set(r.id, { ...r }));
        mumbaiTransitData_js_1.initialNotifications.forEach(n => this.notifications.set(n.id, { ...n }));
        // Demo Admin & Passenger profiles for out-of-the-box testing
        this.profiles.set('admin-1', {
            uid: 'admin-1',
            email: 'admin@goflow.mumbai',
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
    }
    // --- Lines ---
    async getLines() {
        if ((0, firebase_js_1.isFirebaseConfigured)()) {
            try {
                const snap = await (0, firebase_js_1.getFirestore)().collection('lines').get();
                if (!snap.empty) {
                    return snap.docs.map(doc => doc.data());
                }
            }
            catch (err) {
                console.warn('[Firestore] Error fetching lines, falling back to cache:', err);
            }
        }
        return Array.from(this.lines.values());
    }
    async getLineById(id) {
        return this.lines.get(id);
    }
    async createLine(line) {
        this.lines.set(line.id, line);
        if ((0, firebase_js_1.isFirebaseConfigured)()) {
            try {
                await (0, firebase_js_1.getFirestore)().collection('lines').doc(line.id).set(line);
            }
            catch (err) {
                console.error('[Firestore] Error saving line:', err);
            }
        }
        return line;
    }
    async updateLine(id, updates) {
        const existing = this.lines.get(id);
        if (!existing)
            return null;
        const updated = { ...existing, ...updates };
        this.lines.set(id, updated);
        if ((0, firebase_js_1.isFirebaseConfigured)()) {
            try {
                await (0, firebase_js_1.getFirestore)().collection('lines').doc(id).set(updated, { merge: true });
            }
            catch (err) {
                console.error('[Firestore] Error updating line:', err);
            }
        }
        return updated;
    }
    async deleteLine(id) {
        const deleted = this.lines.delete(id);
        if ((0, firebase_js_1.isFirebaseConfigured)()) {
            try {
                await (0, firebase_js_1.getFirestore)().collection('lines').doc(id).delete();
            }
            catch (err) {
                console.error('[Firestore] Error deleting line:', err);
            }
        }
        return deleted;
    }
    // --- Stations ---
    async getStations() {
        if ((0, firebase_js_1.isFirebaseConfigured)()) {
            try {
                const snap = await (0, firebase_js_1.getFirestore)().collection('stations').get();
                if (!snap.empty) {
                    return snap.docs.map(doc => doc.data());
                }
            }
            catch (err) {
                console.warn('[Firestore] Error fetching stations, falling back to cache:', err);
            }
        }
        return Array.from(this.stations.values());
    }
    async getStationById(id) {
        return this.stations.get(id);
    }
    async createStation(station) {
        this.stations.set(station.id, station);
        if ((0, firebase_js_1.isFirebaseConfigured)()) {
            try {
                await (0, firebase_js_1.getFirestore)().collection('stations').doc(station.id).set(station);
            }
            catch (err) {
                console.error('[Firestore] Error saving station:', err);
            }
        }
        return station;
    }
    async updateStation(id, updates) {
        const existing = this.stations.get(id);
        if (!existing)
            return null;
        const updated = { ...existing, ...updates };
        this.stations.set(id, updated);
        if ((0, firebase_js_1.isFirebaseConfigured)()) {
            try {
                await (0, firebase_js_1.getFirestore)().collection('stations').doc(id).set(updated, { merge: true });
            }
            catch (err) {
                console.error('[Firestore] Error updating station:', err);
            }
        }
        return updated;
    }
    async deleteStation(id) {
        const deleted = this.stations.delete(id);
        if ((0, firebase_js_1.isFirebaseConfigured)()) {
            try {
                await (0, firebase_js_1.getFirestore)().collection('stations').doc(id).delete();
            }
            catch (err) {
                console.error('[Firestore] Error deleting station:', err);
            }
        }
        return deleted;
    }
    // --- Crowd Readings ---
    async getCrowdReadings(filters) {
        let list = Array.from(this.crowdReadings.values());
        if (filters?.stationId)
            list = list.filter(r => r.stationId === filters.stationId);
        if (filters?.lineId)
            list = list.filter(r => r.lineId === filters.lineId);
        if (filters?.mode)
            list = list.filter(r => r.mode === filters.mode);
        if (filters?.crowdLevel)
            list = list.filter(r => r.crowdLevel === filters.crowdLevel);
        // Sort latest first
        return list.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    }
    async addCrowdReading(reading) {
        const id = `cr-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
        const newReading = { id, ...reading };
        this.crowdReadings.set(id, newReading);
        if ((0, firebase_js_1.isFirebaseConfigured)()) {
            try {
                await (0, firebase_js_1.getFirestore)().collection('crowdReadings').doc(id).set(newReading);
            }
            catch (err) {
                console.error('[Firestore] Error adding crowd reading:', err);
            }
        }
        return newReading;
    }
    // --- Crowd Reports ---
    async getCrowdReports(status) {
        let list = Array.from(this.crowdReports.values());
        if (status)
            list = list.filter(r => r.status === status);
        return list.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    }
    async addCrowdReport(report) {
        const id = `rep-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
        const newReport = {
            id,
            ...report,
            status: 'pending',
            timestamp: new Date().toISOString()
        };
        this.crowdReports.set(id, newReport);
        if ((0, firebase_js_1.isFirebaseConfigured)()) {
            try {
                await (0, firebase_js_1.getFirestore)().collection('crowdReports').doc(id).set(newReport);
            }
            catch (err) {
                console.error('[Firestore] Error adding report:', err);
            }
        }
        return newReport;
    }
    async reviewCrowdReport(id, status, verifiedBy, reviewNotes) {
        const existing = this.crowdReports.get(id);
        if (!existing)
            return null;
        const updated = {
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
        if ((0, firebase_js_1.isFirebaseConfigured)()) {
            try {
                await (0, firebase_js_1.getFirestore)().collection('crowdReports').doc(id).set(updated, { merge: true });
            }
            catch (err) {
                console.error('[Firestore] Error reviewing report:', err);
            }
        }
        return updated;
    }
    // --- Notifications ---
    async getNotifications(onlyActive = true) {
        let list = Array.from(this.notifications.values());
        if (onlyActive)
            list = list.filter(n => n.active);
        return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }
    async createNotification(notif) {
        const id = `notif-${Date.now()}`;
        const newNotif = {
            id,
            ...notif,
            createdAt: new Date().toISOString(),
            active: true
        };
        this.notifications.set(id, newNotif);
        if ((0, firebase_js_1.isFirebaseConfigured)()) {
            try {
                await (0, firebase_js_1.getFirestore)().collection('notifications').doc(id).set(newNotif);
            }
            catch (err) {
                console.error('[Firestore] Error saving notification:', err);
            }
        }
        return newNotif;
    }
    async dismissNotification(id) {
        const existing = this.notifications.get(id);
        if (!existing)
            return false;
        existing.active = false;
        this.notifications.set(id, existing);
        if ((0, firebase_js_1.isFirebaseConfigured)()) {
            try {
                await (0, firebase_js_1.getFirestore)().collection('notifications').doc(id).update({ active: false });
            }
            catch (err) {
                console.error('[Firestore] Error dismissing notification:', err);
            }
        }
        return true;
    }
    // --- Profiles & Saved Routes ---
    async getProfile(uid) {
        if ((0, firebase_js_1.isFirebaseConfigured)()) {
            try {
                const doc = await (0, firebase_js_1.getFirestore)().collection('profiles').doc(uid).get();
                if (doc.exists)
                    return doc.data();
            }
            catch (err) {
                console.warn('[Firestore] Error getting profile:', err);
            }
        }
        return this.profiles.get(uid) || null;
    }
    async setProfile(profile) {
        this.profiles.set(profile.uid, profile);
        if ((0, firebase_js_1.isFirebaseConfigured)()) {
            try {
                await (0, firebase_js_1.getFirestore)().collection('profiles').doc(profile.uid).set(profile, { merge: true });
            }
            catch (err) {
                console.error('[Firestore] Error saving profile:', err);
            }
        }
        return profile;
    }
    async saveRoute(uid, route) {
        const profile = await this.getProfile(uid);
        if (!profile)
            return null;
        const currentSaved = profile.savedRoutes || [];
        const newRoute = {
            id: `sr-${Date.now()}`,
            ...route,
            savedAt: new Date().toISOString()
        };
        const updated = {
            ...profile,
            savedRoutes: [...currentSaved, newRoute]
        };
        await this.setProfile(updated);
        return updated;
    }
    async deleteSavedRoute(uid, routeId) {
        const profile = await this.getProfile(uid);
        if (!profile)
            return null;
        const updated = {
            ...profile,
            savedRoutes: (profile.savedRoutes || []).filter(r => r.id !== routeId)
        };
        await this.setProfile(updated);
        return updated;
    }
    // --- Analytics ---
    getAnalytics() {
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
            }
            else if (h >= 17 && h <= 20) {
                trainCrowd = 96; // Super Dense Crush Load
                metroCrowd = 84;
                busCrowd = 86;
            }
            else if (h >= 12 && h <= 15) {
                trainCrowd = 38;
                metroCrowd = 42;
                busCrowd = 40;
            }
            const avg = (trainCrowd + metroCrowd + busCrowd) / 3;
            const overallLevel = avg > 75 ? 'high' : avg > 45 ? 'medium' : 'low';
            return {
                hour,
                trainCrowd,
                metroCrowd,
                busCrowd,
                overallLevel
            };
        });
        const stationRankings = [
            { stationId: 'stn-dadar-wr', stationName: 'Dadar (Western & Central)', mode: 'train', crowdLevel: 'high', currentLoad: 94, reportedCrowd: 142 },
            { stationId: 'stn-andheri', stationName: 'Andheri (WR & Metro 1)', mode: 'train', crowdLevel: 'high', currentLoad: 92, reportedCrowd: 135 },
            { stationId: 'stn-ghatkopar', stationName: 'Ghatkopar (CR & Metro 1)', mode: 'train', crowdLevel: 'high', currentLoad: 90, reportedCrowd: 118 },
            { stationId: 'stn-kurla', stationName: 'Kurla Junction (CR & Harbour)', mode: 'train', crowdLevel: 'high', currentLoad: 88, reportedCrowd: 96 },
            { stationId: 'stn-thane', stationName: 'Thane (Central Main Line)', mode: 'train', crowdLevel: 'medium', currentLoad: 72, reportedCrowd: 84 },
            { stationId: 'stn-borivali', stationName: 'Borivali (Western Line)', mode: 'train', crowdLevel: 'medium', currentLoad: 68, reportedCrowd: 79 },
            { stationId: 'stn-csmt', stationName: 'CSMT (South Terminus)', mode: 'train', crowdLevel: 'medium', currentLoad: 58, reportedCrowd: 52 },
            { stationId: 'stn-bkc-m3', stationName: 'BKC (Aqua Line 3 & Feeders)', mode: 'metro', crowdLevel: 'low', currentLoad: 35, reportedCrowd: 28 },
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
exports.store = new TransitStore();

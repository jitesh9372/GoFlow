import {
  collection,
  doc,
  setDoc,
  updateDoc,
  onSnapshot,
  query,
  orderBy,
  limit,
  getDocs,
  serverTimestamp
} from 'firebase/firestore';
import { db } from './firebase';
import { CrowdReport, CrowdReading, ActivityItem } from '../types';

export class FirestoreSyncService {
  private isConnected = false;

  /**
   * Real-time listener for passenger Crowd Reports
   */
  subscribeToCrowdReports(
    callback: (reports: CrowdReport[]) => void,
    onError?: (error: Error) => void
  ): () => void {
    try {
      const reportsRef = collection(db, 'crowdReports');
      const q = query(reportsRef, orderBy('timestamp', 'desc'), limit(50));

      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          this.isConnected = true;
          const reports: CrowdReport[] = [];
          snapshot.forEach((doc) => {
            const data = doc.data() as CrowdReport;
            reports.push({
              ...data,
              id: doc.id
            });
          });
          callback(reports);
        },
        (error) => {
          console.warn('[Firestore] crowdReports onSnapshot error:', error);
          if (onError) onError(error);
        }
      );

      return unsubscribe;
    } catch (err: any) {
      console.warn('[Firestore] Failed to attach listener:', err);
      return () => {};
    }
  }

  /**
   * Real-time listener for System Activities / Audit Feed
   */
  subscribeToActivities(
    callback: (activities: ActivityItem[]) => void,
    onError?: (error: Error) => void
  ): () => void {
    try {
      const actRef = collection(db, 'activities');
      const q = query(actRef, orderBy('timestamp', 'desc'), limit(30));

      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          this.isConnected = true;
          const acts: ActivityItem[] = [];
          snapshot.forEach((doc) => {
            const data = doc.data() as ActivityItem;
            acts.push({
              ...data,
              id: doc.id
            });
          });
          callback(acts);
        },
        (error) => {
          console.warn('[Firestore] activities onSnapshot error:', error);
          if (onError) onError(error);
        }
      );

      return unsubscribe;
    } catch (err: any) {
      console.warn('[Firestore] Failed to attach activities listener:', err);
      return () => {};
    }
  }

  /**
   * Real-time listener for Crowd Readings
   */
  subscribeToCrowdReadings(
    callback: (readings: CrowdReading[]) => void
  ): () => void {
    try {
      const readingsRef = collection(db, 'crowdReadings');
      const q = query(readingsRef, limit(60));

      return onSnapshot(
        q,
        (snapshot) => {
          this.isConnected = true;
          const list: CrowdReading[] = [];
          snapshot.forEach((doc) => {
            list.push({ ...(doc.data() as CrowdReading), id: doc.id });
          });
          callback(list);
        },
        (err) => {
          console.warn('[Firestore] crowdReadings error:', err);
        }
      );
    } catch {
      return () => {};
    }
  }

  /**
   * Submit or sync a crowd report directly to Firestore
   */
  async saveReportToFirestore(report: CrowdReport): Promise<void> {
    try {
      const reportRef = doc(db, 'crowdReports', report.id);
      await setDoc(reportRef, report, { merge: true });

      // Automatically record activity
      await this.logActivity({
        type: 'report_submitted',
        title: `Rush Reported at ${report.stationName}`,
        description: `Commuter ${report.userName} reported ${report.crowdLevel.toUpperCase()} rush on ${report.mode.toUpperCase()}${
          report.notes ? `: "${report.notes}"` : ''
        }`,
        actor: report.userName || 'Commuter',
        stationName: report.stationName,
        crowdLevel: report.crowdLevel,
        timestamp: report.timestamp || new Date().toISOString()
      });
    } catch (err: any) {
      console.warn('[Firestore] Failed to write report to Firestore:', err);
      throw err;
    }
  }

  /**
   * Review (verify or reject) a crowd report in Firestore
   */
  async reviewReportInFirestore(
    reportId: string,
    status: 'verified' | 'rejected',
    reviewerName: string,
    reviewNotes?: string,
    existingReport?: CrowdReport
  ): Promise<void> {
    try {
      const reportRef = doc(db, 'crowdReports', reportId);
      const updates = {
        status,
        verifiedBy: reviewerName,
        verifiedAt: new Date().toISOString(),
        reviewNotes: reviewNotes || (status === 'verified' ? 'Verified by GoFlow Control' : 'Rejected after verification')
      };
      await updateDoc(reportRef, updates);

      // If verified, update station crowd reading in Firestore
      if (status === 'verified' && existingReport) {
        const readingId = `reading-${existingReport.stationId}`;
        const occupancy = existingReport.crowdLevel === 'high' ? 88 : existingReport.crowdLevel === 'medium' ? 62 : 28;
        const readingRef = doc(db, 'crowdReadings', readingId);
        await setDoc(
          readingRef,
          {
            id: readingId,
            stationId: existingReport.stationId,
            stationName: existingReport.stationName,
            mode: existingReport.mode,
            crowdLevel: existingReport.crowdLevel,
            occupancyPercentage: occupancy,
            source: 'passenger_report',
            timestamp: new Date().toISOString(),
            coachType: existingReport.coachType || 'all',
            verified: true
          },
          { merge: true }
        );
      }

      // Record activity
      await this.logActivity({
        type: status === 'verified' ? 'report_verified' : 'report_rejected',
        title: `Report ${status === 'verified' ? 'Verified' : 'Rejected'}: ${existingReport?.stationName || reportId}`,
        description: `Admin ${reviewerName} marked submission as ${status.toUpperCase()}${
          reviewNotes ? ` (${reviewNotes})` : ''
        }`,
        actor: reviewerName,
        stationName: existingReport?.stationName,
        crowdLevel: existingReport?.crowdLevel,
        timestamp: new Date().toISOString()
      });
    } catch (err: any) {
      console.warn('[Firestore] Failed to review report in Firestore:', err);
      throw err;
    }
  }

  /**
   * Log an activity item to Firestore activities collection
   */
  async logActivity(item: Omit<ActivityItem, 'id'>): Promise<void> {
    try {
      const actId = `act-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
      const actRef = doc(db, 'activities', actId);
      await setDoc(actRef, {
        id: actId,
        ...item
      });
    } catch (err) {
      console.warn('[Firestore] Failed to write activity log:', err);
    }
  }

  /**
   * Seed initial Mumbai reports & activities into Firestore if collection is empty
   */
  async seedInitialDataIfEmpty(initialReports: CrowdReport[], initialReadings: CrowdReading[]): Promise<void> {
    try {
      const snap = await getDocs(query(collection(db, 'crowdReports'), limit(1)));
      if (snap.empty && initialReports.length > 0) {
        console.log('[Firestore] Seeding initial Mumbai crowd reports to Firestore...');
        for (const rep of initialReports) {
          await setDoc(doc(db, 'crowdReports', rep.id), rep);
        }

        // Add starter activities
        const starterActivities: Array<Omit<ActivityItem, 'id'>> = [
          {
            type: 'report_submitted',
            title: 'Rush Reported at Dadar (Western)',
            description: 'Heavy commuter congestion on platform 3 fast local rake',
            actor: 'Priya Sharma',
            stationName: 'Dadar (Western)',
            crowdLevel: 'high',
            timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString()
          },
          {
            type: 'report_verified',
            title: 'Report Verified: Borivali',
            description: 'Admin verified passenger rush report against station CCTV',
            actor: 'Transit Operations Controller',
            stationName: 'Borivali',
            crowdLevel: 'high',
            timestamp: new Date(Date.now() - 1000 * 60 * 18).toISOString()
          },
          {
            type: 'report_submitted',
            title: 'Rush Reported at Andheri',
            description: 'Moderate queue at Metro 1 FOB interchange connector',
            actor: 'Rahul Varma',
            stationName: 'Andheri',
            crowdLevel: 'medium',
            timestamp: new Date(Date.now() - 1000 * 60 * 35).toISOString()
          }
        ];

        for (const act of starterActivities) {
          await this.logActivity(act);
        }
      }

      // Seed readings if empty
      const readingSnap = await getDocs(query(collection(db, 'crowdReadings'), limit(1)));
      if (readingSnap.empty && initialReadings.length > 0) {
        for (const r of initialReadings.slice(0, 15)) {
          await setDoc(doc(db, 'crowdReadings', r.id), r);
        }
      }
    } catch (err) {
      console.warn('[Firestore] Error during initial seed check:', err);
    }
  }
}

export const firestoreSync = new FirestoreSyncService();

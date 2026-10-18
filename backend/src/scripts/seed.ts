import { isFirebaseConfigured, getFirestore } from '../config/firebase.js';
import { transitLines, stations, initialCrowdReadings, initialCrowdReports, initialNotifications } from '../data/mumbaiTransitData.js';

async function seedFirestore() {
  if (!isFirebaseConfigured()) {
    console.log('Firebase credentials not detected in .env. Skipping remote Firestore seed.');
    console.log('In-memory store is ready and populated automatically!');
    process.exit(0);
  }

  const db = getFirestore()!;
  console.log('Starting seed to Firestore...');

  try {
    // Seed lines
    console.log(`Writing ${transitLines.length} transit lines...`);
    for (const line of transitLines) {
      await db.collection('lines').doc(line.id).set(line, { merge: true });
    }

    // Seed stations
    console.log(`Writing ${stations.length} stations/stops...`);
    for (const station of stations) {
      await db.collection('stations').doc(station.id).set(station, { merge: true });
    }

    // Seed crowd readings
    console.log(`Writing ${initialCrowdReadings.length} initial crowd readings...`);
    for (const reading of initialCrowdReadings) {
      await db.collection('crowdReadings').doc(reading.id).set(reading, { merge: true });
    }

    // Seed crowd reports
    console.log(`Writing ${initialCrowdReports.length} crowd reports...`);
    for (const report of initialCrowdReports) {
      await db.collection('crowdReports').doc(report.id).set(report, { merge: true });
    }

    // Seed notifications
    console.log(`Writing ${initialNotifications.length} notifications...`);
    for (const notif of initialNotifications) {
      await db.collection('notifications').doc(notif.id).set(notif, { merge: true });
    }

    console.log('✅ Firestore seed completed successfully!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Failed to seed Firestore:', err);
    process.exit(1);
  }
}

seedFirestore();

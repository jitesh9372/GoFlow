"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const firebase_js_1 = require("../config/firebase.js");
const mumbaiTransitData_js_1 = require("../data/mumbaiTransitData.js");
async function seedFirestore() {
    if (!(0, firebase_js_1.isFirebaseConfigured)()) {
        console.log('Firebase credentials not detected in .env. Skipping remote Firestore seed.');
        console.log('In-memory store is ready and populated automatically!');
        process.exit(0);
    }
    const db = (0, firebase_js_1.getFirestore)();
    console.log('Starting seed to Firestore...');
    try {
        // Seed lines
        console.log(`Writing ${mumbaiTransitData_js_1.transitLines.length} transit lines...`);
        for (const line of mumbaiTransitData_js_1.transitLines) {
            await db.collection('lines').doc(line.id).set(line, { merge: true });
        }
        // Seed stations
        console.log(`Writing ${mumbaiTransitData_js_1.stations.length} stations/stops...`);
        for (const station of mumbaiTransitData_js_1.stations) {
            await db.collection('stations').doc(station.id).set(station, { merge: true });
        }
        // Seed crowd readings
        console.log(`Writing ${mumbaiTransitData_js_1.initialCrowdReadings.length} initial crowd readings...`);
        for (const reading of mumbaiTransitData_js_1.initialCrowdReadings) {
            await db.collection('crowdReadings').doc(reading.id).set(reading, { merge: true });
        }
        // Seed crowd reports
        console.log(`Writing ${mumbaiTransitData_js_1.initialCrowdReports.length} crowd reports...`);
        for (const report of mumbaiTransitData_js_1.initialCrowdReports) {
            await db.collection('crowdReports').doc(report.id).set(report, { merge: true });
        }
        // Seed notifications
        console.log(`Writing ${mumbaiTransitData_js_1.initialNotifications.length} notifications...`);
        for (const notif of mumbaiTransitData_js_1.initialNotifications) {
            await db.collection('notifications').doc(notif.id).set(notif, { merge: true });
        }
        console.log('✅ Firestore seed completed successfully!');
        process.exit(0);
    }
    catch (err) {
        console.error('❌ Failed to seed Firestore:', err);
        process.exit(1);
    }
}
seedFirestore();

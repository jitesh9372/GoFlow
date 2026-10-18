import admin from 'firebase-admin';
import dotenv from 'dotenv';

dotenv.config();

let initialized = false;
let authInstance: admin.auth.Auth | null = null;
let firestoreInstance: admin.firestore.Firestore | null = null;

try {
  if (process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
    initialized = true;
    console.log('[Firebase] Admin SDK initialized via FIREBASE_SERVICE_ACCOUNT_JSON');
  } else if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY) {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
      })
    });
    initialized = true;
    console.log('[Firebase] Admin SDK initialized via individual env credentials');
  } else {
    console.warn('[Firebase] No Service Account credentials provided. Running in Graceful Local/Mock Mode with full schema and rules simulation.');
  }

  if (initialized) {
    authInstance = admin.auth();
    firestoreInstance = admin.firestore();
  }
} catch (err) {
  console.error('[Firebase] Initialization error (falling back to Mock Mode):', err);
  initialized = false;
}

export const isFirebaseConfigured = (): boolean => initialized;
export const getAdminAuth = () => authInstance;
export const getFirestore = () => firestoreInstance;
export { admin };

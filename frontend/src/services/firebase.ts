import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyA4AcuigwlNpvP35miKEhh4faoJA2910fs',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'goflow-ce18e.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'goflow-ce18e',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'goflow-ce18e.firebasestorage.app',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '636693923215',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:636693923215:web:7efeb9ec36fa6e6e9cf7fa'
};

export const isFirebaseConfigured = true;

// Initialize Firebase
export const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// Firebase Authentication instance
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Firestore Database instance
export const db = getFirestore(app);

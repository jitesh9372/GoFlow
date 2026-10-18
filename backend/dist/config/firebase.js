"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.admin = exports.getFirestore = exports.getAdminAuth = exports.isFirebaseConfigured = void 0;
const firebase_admin_1 = __importDefault(require("firebase-admin"));
exports.admin = firebase_admin_1.default;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
let initialized = false;
let authInstance = null;
let firestoreInstance = null;
try {
    if (process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
        const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);
        firebase_admin_1.default.initializeApp({
            credential: firebase_admin_1.default.credential.cert(serviceAccount)
        });
        initialized = true;
        console.log('[Firebase] Admin SDK initialized via FIREBASE_SERVICE_ACCOUNT_JSON');
    }
    else if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY) {
        firebase_admin_1.default.initializeApp({
            credential: firebase_admin_1.default.credential.cert({
                projectId: process.env.FIREBASE_PROJECT_ID,
                clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
                privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
            })
        });
        initialized = true;
        console.log('[Firebase] Admin SDK initialized via individual env credentials');
    }
    else {
        console.warn('[Firebase] No Service Account credentials provided. Running in Graceful Local/Mock Mode with full schema and rules simulation.');
    }
    if (initialized) {
        authInstance = firebase_admin_1.default.auth();
        firestoreInstance = firebase_admin_1.default.firestore();
    }
}
catch (err) {
    console.error('[Firebase] Initialization error (falling back to Mock Mode):', err);
    initialized = false;
}
const isFirebaseConfigured = () => initialized;
exports.isFirebaseConfigured = isFirebaseConfigured;
const getAdminAuth = () => authInstance;
exports.getAdminAuth = getAdminAuth;
const getFirestore = () => firestoreInstance;
exports.getFirestore = getFirestore;

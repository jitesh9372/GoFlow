import { Router } from 'express';
import { z } from 'zod';
import { verifyToken } from '../middleware/auth.js';
import { getAdminAuth, isFirebaseConfigured } from '../config/firebase.js';
import { store } from '../services/store.js';
export const authRouter = Router();
const isAdminEmail = (email) => {
    const lower = email.trim().toLowerCase();
    return lower === 'admin@123' || lower === 'admin@gmail.com';
};
// -------------------------------------------------------------
// 1. Account Registration (Backend only - creates user, role claim, profiles/{uid})
// -------------------------------------------------------------
const registerSchema = z.object({
    email: z.string().email(),
    password: z.string().min(6),
    displayName: z.string().min(2).optional(),
    role: z.enum(['admin', 'passenger']).optional()
});
authRouter.post('/register', async (req, res) => {
    try {
        const parse = registerSchema.safeParse(req.body);
        if (!parse.success) {
            return res.status(400).json({ error: 'Invalid registration parameters', details: parse.error.format() });
        }
        const { email, password, displayName, role: requestedRole } = parse.data;
        const trimmedEmail = email.trim().toLowerCase();
        // Prevent signing up with admin secret email
        if (isAdminEmail(trimmedEmail)) {
            return res.status(400).json({
                error: `${trimmedEmail} is reserved for administrator login. Please sign in on the Sign In page.`
            });
        }
        // Check if an account already exists in profiles
        const existingProfile = await store.getProfileByEmail(trimmedEmail);
        if (existingProfile) {
            return res.status(400).json({ error: 'User already exists. Please sign in' });
        }
        const role = requestedRole === 'admin' ? 'admin' : 'passenger';
        const cleanDisplayName = displayName?.trim() || trimmedEmail.split('@')[0] || 'Passenger';
        let uid = '';
        if (isFirebaseConfigured() && getAdminAuth()) {
            try {
                const userRecord = await getAdminAuth().createUser({
                    email: trimmedEmail,
                    password,
                    displayName: cleanDisplayName
                });
                uid = userRecord.uid;
                // Set custom user claims with role
                await getAdminAuth().setCustomUserClaims(uid, { role });
            }
            catch (fbErr) {
                if (fbErr.code === 'auth/email-already-exists') {
                    return res.status(400).json({ error: 'User already exists. Please sign in' });
                }
                return res.status(400).json({ error: fbErr.message || 'Failed to create user' });
            }
        }
        else {
            // Fallback: Create user in Firebase Web project via Identity Toolkit REST API
            const apiKey = process.env.VITE_FIREBASE_API_KEY || process.env.FIREBASE_API_KEY || 'AIzaSyA4AcuigwlNpvP35miKEhh4faoJA2910fs';
            try {
                const restRes = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${apiKey}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        email: trimmedEmail,
                        password,
                        returnSecureToken: true
                    })
                });
                const restData = await restRes.json();
                if (!restRes.ok) {
                    if (restData.error?.message === 'EMAIL_EXISTS') {
                        return res.status(400).json({ error: 'User already exists. Please sign in' });
                    }
                    throw new Error(restData.error?.message || 'Firebase Auth error');
                }
                uid = restData.localId;
            }
            catch (restErr) {
                if (restErr.message === 'User already exists. Please sign in') {
                    return res.status(400).json({ error: 'User already exists. Please sign in' });
                }
                console.warn('[Register] REST user creation fallback to local ID:', restErr.message);
                uid = `usr-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
            }
        }
        // Create the profiles/{uid} document
        const profile = {
            uid,
            email: trimmedEmail,
            displayName: cleanDisplayName,
            role,
            createdAt: new Date().toISOString(),
            savedRoutes: []
        };
        await store.setProfile(profile);
        return res.status(201).json({
            success: true,
            message: 'Account created successfully',
            user: profile
        });
    }
    catch (err) {
        console.error('[Register] Error:', err);
        return res.status(500).json({ error: 'Registration failed', details: err.message });
    }
});
// -------------------------------------------------------------
// 2. Profile Verification on Login: GET /api/auth/me
// Returns profile and role if valid profiles/{uid} and role exist,
// otherwise verifyToken rejects with 403
// -------------------------------------------------------------
authRouter.get('/me', verifyToken, async (req, res) => {
    try {
        const uid = req.user.uid;
        const profile = await store.getProfile(uid);
        if (!profile || !profile.role) {
            return res.status(403).json({ error: 'No account found. Please sign up first.' });
        }
        return res.json({ profile, role: profile.role });
    }
    catch (err) {
        return res.status(500).json({ error: 'Failed to verify account', details: err.message });
    }
});
// -------------------------------------------------------------
// 3. Registered Account Check: GET /api/auth/check-registered
// -------------------------------------------------------------
authRouter.get('/check-registered', async (req, res) => {
    try {
        const email = (req.query.email || '').trim().toLowerCase();
        if (!email) {
            return res.json({ registered: false });
        }
        if (isAdminEmail(email)) {
            return res.json({ registered: true, role: 'admin' });
        }
        const profile = await store.getProfileByEmail(email);
        return res.json({ registered: !!profile, role: profile?.role || null });
    }
    catch (err) {
        return res.status(500).json({ error: 'Check failed', details: err.message });
    }
});
// -------------------------------------------------------------
// 4. Role Setting: POST /api/auth/set-role
// -------------------------------------------------------------
const setRoleSchema = z.object({
    uid: z.string().min(1),
    role: z.enum(['admin', 'passenger'])
});
authRouter.post('/set-role', async (req, res) => {
    try {
        const parse = setRoleSchema.safeParse(req.body);
        if (!parse.success) {
            return res.status(400).json({ error: 'Invalid payload', details: parse.error.format() });
        }
        const { uid, role } = parse.data;
        // Set custom claim in Firebase Auth if available
        if (isFirebaseConfigured() && getAdminAuth()) {
            await getAdminAuth().setCustomUserClaims(uid, { role });
        }
        // Update store profile
        let profile = await store.getProfile(uid);
        if (profile) {
            profile.role = role;
            await store.setProfile(profile);
        }
        else {
            profile = await store.setProfile({
                uid,
                email: `${role}@goflow.mumbai`,
                displayName: role === 'admin' ? 'Transit Admin' : 'Commuter',
                role,
                createdAt: new Date().toISOString()
            });
        }
        return res.json({ success: true, uid, role, profile });
    }
    catch (err) {
        console.error('Error setting role:', err);
        return res.status(500).json({ error: 'Failed to assign role', details: err.message });
    }
});
// -------------------------------------------------------------
// 5. Current Profile: GET /api/auth/profile
// -------------------------------------------------------------
authRouter.get('/profile', verifyToken, async (req, res) => {
    try {
        const uid = req.user.uid;
        const profile = await store.getProfile(uid);
        if (!profile) {
            return res.status(403).json({ error: 'No account found. Please sign up first.' });
        }
        return res.json({ profile });
    }
    catch (err) {
        return res.status(500).json({ error: 'Failed to get profile', details: err.message });
    }
});
// -------------------------------------------------------------
// 6. Saved Routes: POST & DELETE
// -------------------------------------------------------------
const saveRouteSchema = z.object({
    fromStationId: z.string(),
    fromStationName: z.string(),
    toStationId: z.string(),
    toStationName: z.string(),
    preferredMode: z.string().optional()
});
authRouter.post('/saved-routes', verifyToken, async (req, res) => {
    try {
        const parse = saveRouteSchema.safeParse(req.body);
        if (!parse.success) {
            return res.status(400).json({ error: 'Invalid payload', details: parse.error.format() });
        }
        const updated = await store.saveRoute(req.user.uid, parse.data);
        return res.json({ profile: updated });
    }
    catch (err) {
        return res.status(500).json({ error: 'Failed to save route', details: err.message });
    }
});
authRouter.delete('/saved-routes/:routeId', verifyToken, async (req, res) => {
    try {
        const updated = await store.deleteSavedRoute(req.user.uid, req.params.routeId);
        return res.json({ profile: updated });
    }
    catch (err) {
        return res.status(500).json({ error: 'Failed to remove saved route', details: err.message });
    }
});
// -------------------------------------------------------------
// 7. Secure Login Endpoint (NO auto-creation!)
// Only seeded admin or verified registered users
// -------------------------------------------------------------
const loginSchema = z.object({
    email: z.string().min(1),
    password: z.string().min(1)
});
authRouter.post('/login', async (req, res) => {
    try {
        const parse = loginSchema.safeParse(req.body);
        if (!parse.success) {
            return res.status(400).json({ error: 'Email or password is incorrect' });
        }
        const email = parse.data.email.trim().toLowerCase();
        const password = parse.data.password;
        // Admin Credentials Authentication
        if (isAdminEmail(email)) {
            if (password === 'admin#1234' || password === 'admin#123') {
                let adminProfile = await store.getProfile('admin-goflow-master') || await store.getProfile('admin-1');
                if (!adminProfile) {
                    adminProfile = await store.setProfile({
                        uid: 'admin-goflow-master',
                        email: email === 'admin@123' ? 'admin@123' : 'admin@gmail.com',
                        displayName: 'Mumbai Transit Control Admin',
                        role: 'admin',
                        createdAt: new Date().toISOString()
                    });
                }
                return res.json({
                    token: 'mock-admin-token',
                    user: adminProfile
                });
            }
            else {
                return res.status(401).json({ error: 'Email or password is incorrect' });
            }
        }
        // Normal Passenger: MUST have registered previously (profile exists in store)
        const existing = await store.getProfileByEmail(email);
        if (!existing) {
            return res.status(401).json({ error: 'No account found. Please sign up first.' });
        }
        // User exists in GoFlow: In Firebase mode, client must authenticate via signInWithEmailAndPassword
        return res.json({
            token: 'mock-passenger-token',
            user: existing
        });
    }
    catch (err) {
        return res.status(500).json({ error: 'Authentication failed', details: err.message });
    }
});
// Demo login helper
authRouter.post('/demo-login', async (req, res) => {
    const { role } = req.body;
    const targetRole = role === 'admin' ? 'admin' : 'passenger';
    const token = targetRole === 'admin' ? 'mock-admin-token' : 'mock-passenger-token';
    const user = targetRole === 'admin'
        ? {
            uid: 'admin-1',
            email: 'admin@123',
            displayName: 'Mumbai Transit Control Admin',
            role: 'admin'
        }
        : {
            uid: 'passenger-1',
            email: 'passenger@goflow.mumbai',
            displayName: 'Daily Mumbai Commuter',
            role: 'passenger'
        };
    return res.json({
        token,
        user
    });
});

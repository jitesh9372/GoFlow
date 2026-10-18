"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authRouter = void 0;
const express_1 = require("express");
const zod_1 = require("zod");
const auth_js_1 = require("../middleware/auth.js");
const firebase_js_1 = require("../config/firebase.js");
const store_js_1 = require("../services/store.js");
exports.authRouter = (0, express_1.Router)();
// Set user role (custom claim)
const setRoleSchema = zod_1.z.object({
    uid: zod_1.z.string().min(1),
    role: zod_1.z.enum(['admin', 'passenger'])
});
exports.authRouter.post('/set-role', async (req, res) => {
    try {
        const parse = setRoleSchema.safeParse(req.body);
        if (!parse.success) {
            return res.status(400).json({ error: 'Invalid payload', details: parse.error.format() });
        }
        const { uid, role } = parse.data;
        // Set custom claim in Firebase Auth if available
        if ((0, firebase_js_1.isFirebaseConfigured)() && (0, firebase_js_1.getAdminAuth)()) {
            await (0, firebase_js_1.getAdminAuth)().setCustomUserClaims(uid, { role });
        }
        // Update store profile
        let profile = await store_js_1.store.getProfile(uid);
        if (profile) {
            profile.role = role;
            await store_js_1.store.setProfile(profile);
        }
        else {
            profile = await store_js_1.store.setProfile({
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
// Get current profile
exports.authRouter.get('/profile', auth_js_1.authenticate, async (req, res) => {
    try {
        const uid = req.user.uid;
        let profile = await store_js_1.store.getProfile(uid);
        if (!profile) {
            profile = {
                uid,
                email: req.user.email,
                displayName: req.user.displayName,
                role: req.user.role,
                createdAt: new Date().toISOString(),
                savedRoutes: []
            };
            await store_js_1.store.setProfile(profile);
        }
        return res.json({ profile });
    }
    catch (err) {
        return res.status(500).json({ error: 'Failed to get profile', details: err.message });
    }
});
// Save route
const saveRouteSchema = zod_1.z.object({
    fromStationId: zod_1.z.string(),
    fromStationName: zod_1.z.string(),
    toStationId: zod_1.z.string(),
    toStationName: zod_1.z.string(),
    preferredMode: zod_1.z.string().optional()
});
exports.authRouter.post('/saved-routes', auth_js_1.authenticate, async (req, res) => {
    try {
        const parse = saveRouteSchema.safeParse(req.body);
        if (!parse.success) {
            return res.status(400).json({ error: 'Invalid payload', details: parse.error.format() });
        }
        const updated = await store_js_1.store.saveRoute(req.user.uid, parse.data);
        return res.json({ profile: updated });
    }
    catch (err) {
        return res.status(500).json({ error: 'Failed to save route', details: err.message });
    }
});
// Delete saved route
exports.authRouter.delete('/saved-routes/:routeId', auth_js_1.authenticate, async (req, res) => {
    try {
        const updated = await store_js_1.store.deleteSavedRoute(req.user.uid, req.params.routeId);
        return res.json({ profile: updated });
    }
    catch (err) {
        return res.status(500).json({ error: 'Failed to remove saved route', details: err.message });
    }
});
// Backend secure login endpoint
const loginSchema = zod_1.z.object({
    email: zod_1.z.string().min(1),
    password: zod_1.z.string().min(1)
});
exports.authRouter.post('/login', async (req, res) => {
    try {
        const parse = loginSchema.safeParse(req.body);
        if (!parse.success) {
            return res.status(400).json({ error: 'Email or password is incorrect' });
        }
        const email = parse.data.email.trim().toLowerCase();
        const password = parse.data.password;
        // Admin Credentials Authentication
        if (email === 'admin@123' || email === 'admin@gmail.com') {
            if (password === 'admin#1234' || password === 'admin#123') {
                const user = {
                    uid: 'admin-goflow-master',
                    email: email === 'admin@123' ? 'admin@123' : 'admin@gmail.com',
                    displayName: 'Mumbai Transit Control Admin',
                    role: 'admin',
                    createdAt: new Date().toISOString()
                };
                return res.json({
                    token: 'mock-admin-token',
                    user
                });
            }
            else {
                return res.status(401).json({ error: 'Email or password is incorrect' });
            }
        }
        // Normal Passenger / Commuter Authentication
        const user = {
            uid: `psg-${Date.now()}`,
            email,
            displayName: email.split('@')[0] || 'Passenger',
            role: 'passenger',
            createdAt: new Date().toISOString()
        };
        return res.json({
            token: 'mock-passenger-token',
            user
        });
    }
    catch (err) {
        return res.status(500).json({ error: 'Authentication failed', details: err.message });
    }
});
// Demo login helper for instant switching
exports.authRouter.post('/demo-login', async (req, res) => {
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

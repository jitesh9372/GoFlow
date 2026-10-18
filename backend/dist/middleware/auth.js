"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticate = authenticate;
exports.requireAdmin = requireAdmin;
const firebase_js_1 = require("../config/firebase.js");
async function authenticate(req, res, next) {
    const authHeader = req.headers.authorization;
    const mockRoleHeader = req.headers['x-mock-role'];
    // Check for mock/dev tokens or mock header
    if (mockRoleHeader === 'admin' || authHeader === 'Bearer mock-admin-token') {
        req.user = {
            uid: 'admin-1',
            email: 'admin@123',
            displayName: 'Mumbai Transit Control Admin',
            role: 'admin'
        };
        return next();
    }
    if (mockRoleHeader === 'passenger' || authHeader === 'Bearer mock-passenger-token') {
        req.user = {
            uid: 'passenger-1',
            email: 'passenger@goflow.mumbai',
            displayName: 'Daily Mumbai Commuter',
            role: 'passenger'
        };
        return next();
    }
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Missing or malformed Authorization header' });
    }
    const token = authHeader.split('Bearer ')[1];
    if ((0, firebase_js_1.isFirebaseConfigured)() && (0, firebase_js_1.getAdminAuth)()) {
        try {
            const decoded = await (0, firebase_js_1.getAdminAuth)().verifyIdToken(token);
            const role = (decoded.email === 'admin@123' || decoded.email === 'admin@gmail.com') ? 'admin' : (decoded.role || 'passenger');
            req.user = {
                uid: decoded.uid,
                email: decoded.email || '',
                displayName: decoded.name || decoded.email?.split('@')[0] || (role === 'admin' ? 'Transit Admin' : 'Passenger'),
                role
            };
            return next();
        }
        catch (err) {
            console.error('[Auth Middleware] Token verification failed:', err.message);
            return res.status(401).json({ error: 'Invalid or expired Firebase auth token', details: err.message });
        }
    }
    // Fallback for development if token is present
    req.user = {
        uid: 'passenger-1',
        email: 'passenger@goflow.mumbai',
        displayName: 'Daily Mumbai Commuter',
        role: 'passenger'
    };
    return next();
}
function requireAdmin(req, res, next) {
    if (!req.user) {
        return res.status(401).json({ error: 'Authentication required' });
    }
    if (req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Forbidden: Admin privilege required' });
    }
    return next();
}

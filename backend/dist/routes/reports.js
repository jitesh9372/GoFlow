"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.reportsRouter = void 0;
const express_1 = require("express");
const zod_1 = require("zod");
const store_js_1 = require("../services/store.js");
const auth_js_1 = require("../middleware/auth.js");
exports.reportsRouter = (0, express_1.Router)();
const submitReportSchema = zod_1.z.object({
    stationId: zod_1.z.string().min(1),
    stationName: zod_1.z.string().min(1),
    mode: zod_1.z.enum(['train', 'metro', 'bus']),
    lineId: zod_1.z.string().optional(),
    crowdLevel: zod_1.z.enum(['low', 'medium', 'high']),
    coachType: zod_1.z.enum(['general', 'ladies', 'first_class', 'ac', 'all']).optional(),
    direction: zod_1.z.string().optional(),
    notes: zod_1.z.string().max(500).optional()
});
const reviewReportSchema = zod_1.z.object({
    status: zod_1.z.enum(['verified', 'rejected']),
    reviewNotes: zod_1.z.string().optional()
});
// List crowd reports (only verified are public; pending and rejected require admin)
exports.reportsRouter.get('/', async (req, res) => {
    try {
        const status = req.query.status;
        if (status === 'pending' || status === 'rejected' || !status) {
            const authHeader = req.headers.authorization;
            const mockRole = req.headers['x-mock-role'];
            const isAdmin = mockRole === 'admin' || authHeader === 'Bearer mock-admin-token';
            if (!isAdmin) {
                if (status === 'pending' || status === 'rejected') {
                    return res.status(403).json({ error: 'Forbidden: Admin privilege required to view unverified reports' });
                }
                // Public commuter request without filter only receives verified reports
                const reports = await store_js_1.store.getCrowdReports('verified');
                return res.json({ reports });
            }
        }
        const reports = await store_js_1.store.getCrowdReports(status);
        return res.json({ reports });
    }
    catch (err) {
        return res.status(500).json({ error: 'Failed to fetch reports', details: err.message });
    }
});
// Submit report
exports.reportsRouter.post('/', auth_js_1.authenticate, async (req, res) => {
    try {
        const parse = submitReportSchema.safeParse(req.body);
        if (!parse.success) {
            return res.status(400).json({ error: 'Invalid report data', details: parse.error.format() });
        }
        const report = await store_js_1.store.addCrowdReport({
            ...parse.data,
            userId: req.user.uid,
            userEmail: req.user.email,
            userName: req.user.displayName
        });
        return res.status(201).json({ report });
    }
    catch (err) {
        return res.status(500).json({ error: 'Failed to submit report', details: err.message });
    }
});
// Review report (Admin)
exports.reportsRouter.patch('/:id/review', auth_js_1.authenticate, auth_js_1.requireAdmin, async (req, res) => {
    try {
        const parse = reviewReportSchema.safeParse(req.body);
        if (!parse.success) {
            return res.status(400).json({ error: 'Invalid review payload', details: parse.error.format() });
        }
        const { status, reviewNotes } = parse.data;
        const reviewed = await store_js_1.store.reviewCrowdReport(req.params.id, status, req.user.displayName || 'Admin', reviewNotes);
        if (!reviewed)
            return res.status(404).json({ error: 'Report not found' });
        return res.json({ report: reviewed });
    }
    catch (err) {
        return res.status(500).json({ error: 'Failed to review report', details: err.message });
    }
});

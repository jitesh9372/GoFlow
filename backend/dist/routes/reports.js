import { Router } from 'express';
import { z } from 'zod';
import { store } from '../services/store.js';
import { authenticate, requireAdmin } from '../middleware/auth.js';
export const reportsRouter = Router();
const submitReportSchema = z.object({
    stationId: z.string().min(1),
    stationName: z.string().min(1),
    mode: z.enum(['train', 'metro', 'bus']),
    lineId: z.string().optional(),
    crowdLevel: z.enum(['low', 'medium', 'high']),
    coachType: z.enum(['general', 'ladies', 'first_class', 'ac', 'all']).optional(),
    direction: z.string().optional(),
    notes: z.string().max(500).optional()
});
const reviewReportSchema = z.object({
    status: z.enum(['verified', 'rejected']),
    reviewNotes: z.string().optional()
});
// List crowd reports (only verified are public; pending and rejected require admin)
reportsRouter.get('/', async (req, res) => {
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
                const reports = await store.getCrowdReports('verified');
                return res.json({ reports });
            }
        }
        const reports = await store.getCrowdReports(status);
        return res.json({ reports });
    }
    catch (err) {
        return res.status(500).json({ error: 'Failed to fetch reports', details: err.message });
    }
});
// Submit report
reportsRouter.post('/', authenticate, async (req, res) => {
    try {
        const parse = submitReportSchema.safeParse(req.body);
        if (!parse.success) {
            return res.status(400).json({ error: 'Invalid report data', details: parse.error.format() });
        }
        const report = await store.addCrowdReport({
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
reportsRouter.patch('/:id/review', authenticate, requireAdmin, async (req, res) => {
    try {
        const parse = reviewReportSchema.safeParse(req.body);
        if (!parse.success) {
            return res.status(400).json({ error: 'Invalid review payload', details: parse.error.format() });
        }
        const { status, reviewNotes } = parse.data;
        const reviewed = await store.reviewCrowdReport(req.params.id, status, req.user.displayName || 'Admin', reviewNotes);
        if (!reviewed)
            return res.status(404).json({ error: 'Report not found' });
        return res.json({ report: reviewed });
    }
    catch (err) {
        return res.status(500).json({ error: 'Failed to review report', details: err.message });
    }
});

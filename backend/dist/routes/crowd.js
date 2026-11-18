import { Router } from 'express';
import { z } from 'zod';
import { store } from '../services/store.js';
import { authenticate, requireAdmin } from '../middleware/auth.js';
export const crowdRouter = Router();
const crowdReadingSchema = z.object({
    stationId: z.string().min(1),
    stationName: z.string().min(1),
    lineId: z.string().optional(),
    mode: z.enum(['train', 'metro', 'bus']),
    crowdLevel: z.enum(['low', 'medium', 'high']),
    occupancyPercentage: z.number().min(0).max(100),
    source: z.enum(['live_sensor', 'verified_survey', 'passenger_report', 'historical_pattern', 'predicted']),
    timestamp: z.string().optional().default(() => new Date().toISOString()),
    coachType: z.enum(['general', 'ladies', 'first_class', 'ac', 'all']).optional(),
    direction: z.enum(['UP', 'DOWN', 'BOTH']).optional(),
    verified: z.boolean().default(true)
});
// Get readings
crowdRouter.get('/readings', async (req, res) => {
    try {
        const { stationId, lineId, mode, crowdLevel } = req.query;
        const readings = await store.getCrowdReadings({
            stationId: stationId,
            lineId: lineId,
            mode: mode,
            crowdLevel: crowdLevel
        });
        return res.json({ readings });
    }
    catch (err) {
        return res.status(500).json({ error: 'Failed to fetch crowd readings', details: err.message });
    }
});
// Post reading (Admin or sensor ingest)
crowdRouter.post('/readings', authenticate, requireAdmin, async (req, res) => {
    try {
        const parse = crowdReadingSchema.safeParse(req.body);
        if (!parse.success) {
            return res.status(400).json({ error: 'Invalid reading data', details: parse.error.format() });
        }
        const created = await store.addCrowdReading(parse.data);
        return res.status(201).json({ reading: created });
    }
    catch (err) {
        return res.status(500).json({ error: 'Failed to add crowd reading', details: err.message });
    }
});
// Analytics
crowdRouter.get('/analytics', async (_req, res) => {
    try {
        const analytics = store.getAnalytics();
        return res.json({ analytics });
    }
    catch (err) {
        return res.status(500).json({ error: 'Failed to fetch analytics', details: err.message });
    }
});

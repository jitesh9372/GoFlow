"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.crowdRouter = void 0;
const express_1 = require("express");
const zod_1 = require("zod");
const store_js_1 = require("../services/store.js");
const auth_js_1 = require("../middleware/auth.js");
exports.crowdRouter = (0, express_1.Router)();
const crowdReadingSchema = zod_1.z.object({
    stationId: zod_1.z.string().min(1),
    stationName: zod_1.z.string().min(1),
    lineId: zod_1.z.string().optional(),
    mode: zod_1.z.enum(['train', 'metro', 'bus']),
    crowdLevel: zod_1.z.enum(['low', 'medium', 'high']),
    occupancyPercentage: zod_1.z.number().min(0).max(100),
    source: zod_1.z.enum(['live_sensor', 'verified_survey', 'passenger_report', 'historical_pattern', 'predicted']),
    timestamp: zod_1.z.string().optional().default(() => new Date().toISOString()),
    coachType: zod_1.z.enum(['general', 'ladies', 'first_class', 'ac', 'all']).optional(),
    direction: zod_1.z.enum(['UP', 'DOWN', 'BOTH']).optional(),
    verified: zod_1.z.boolean().default(true)
});
// Get readings
exports.crowdRouter.get('/readings', async (req, res) => {
    try {
        const { stationId, lineId, mode, crowdLevel } = req.query;
        const readings = await store_js_1.store.getCrowdReadings({
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
exports.crowdRouter.post('/readings', auth_js_1.authenticate, auth_js_1.requireAdmin, async (req, res) => {
    try {
        const parse = crowdReadingSchema.safeParse(req.body);
        if (!parse.success) {
            return res.status(400).json({ error: 'Invalid reading data', details: parse.error.format() });
        }
        const created = await store_js_1.store.addCrowdReading(parse.data);
        return res.status(201).json({ reading: created });
    }
    catch (err) {
        return res.status(500).json({ error: 'Failed to add crowd reading', details: err.message });
    }
});
// Analytics
exports.crowdRouter.get('/analytics', async (_req, res) => {
    try {
        const analytics = store_js_1.store.getAnalytics();
        return res.json({ analytics });
    }
    catch (err) {
        return res.status(500).json({ error: 'Failed to fetch analytics', details: err.message });
    }
});

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.transportRouter = void 0;
const express_1 = require("express");
const zod_1 = require("zod");
const store_js_1 = require("../services/store.js");
const auth_js_1 = require("../middleware/auth.js");
exports.transportRouter = (0, express_1.Router)();
// Validation Schemas
const transitLineSchema = zod_1.z.object({
    id: zod_1.z.string().min(1),
    name: zod_1.z.string().min(1),
    mode: zod_1.z.enum(['train', 'metro', 'bus']),
    code: zod_1.z.string().min(1),
    color: zod_1.z.string().min(1),
    textColor: zod_1.z.string().default('#ffffff'),
    operator: zod_1.z.string().min(1),
    terminalA: zod_1.z.string().min(1),
    terminalB: zod_1.z.string().min(1),
    stationIds: zod_1.z.array(zod_1.z.string()).default([]),
    totalDistanceKm: zod_1.z.number().nonnegative(),
    averageFrequencyMins: zod_1.z.number().positive(),
    operatingHours: zod_1.z.object({
        start: zod_1.z.string(),
        end: zod_1.z.string()
    })
});
const stationSchema = zod_1.z.object({
    id: zod_1.z.string().min(1),
    name: zod_1.z.string().min(1),
    marathiName: zod_1.z.string().optional(),
    code: zod_1.z.string().min(1),
    mode: zod_1.z.enum(['train', 'metro', 'bus']),
    lineIds: zod_1.z.array(zod_1.z.string()).default([]),
    latitude: zod_1.z.number(),
    longitude: zod_1.z.number(),
    zone: zod_1.z.string().optional(),
    isInterchange: zod_1.z.boolean().default(false),
    interchangeLines: zod_1.z.array(zod_1.z.string()).optional(),
    facilities: zod_1.z.array(zod_1.z.string()).optional(),
    averageDailyFootfall: zod_1.z.number().optional()
});
// --- Lines ---
exports.transportRouter.get('/lines', async (_req, res) => {
    try {
        const lines = await store_js_1.store.getLines();
        return res.json({ lines });
    }
    catch (err) {
        return res.status(500).json({ error: 'Failed to fetch lines', details: err.message });
    }
});
exports.transportRouter.get('/lines/:id', async (req, res) => {
    try {
        const line = await store_js_1.store.getLineById(req.params.id);
        if (!line)
            return res.status(404).json({ error: 'Line not found' });
        return res.json({ line });
    }
    catch (err) {
        return res.status(500).json({ error: 'Failed to fetch line', details: err.message });
    }
});
exports.transportRouter.post('/lines', auth_js_1.authenticate, auth_js_1.requireAdmin, async (req, res) => {
    try {
        const parse = transitLineSchema.safeParse(req.body);
        if (!parse.success) {
            return res.status(400).json({ error: 'Invalid line data', details: parse.error.format() });
        }
        const created = await store_js_1.store.createLine(parse.data);
        return res.status(201).json({ line: created });
    }
    catch (err) {
        return res.status(500).json({ error: 'Failed to create line', details: err.message });
    }
});
exports.transportRouter.put('/lines/:id', auth_js_1.authenticate, auth_js_1.requireAdmin, async (req, res) => {
    try {
        const parse = transitLineSchema.partial().safeParse(req.body);
        if (!parse.success) {
            return res.status(400).json({ error: 'Invalid update data', details: parse.error.format() });
        }
        const updated = await store_js_1.store.updateLine(req.params.id, parse.data);
        if (!updated)
            return res.status(404).json({ error: 'Line not found' });
        return res.json({ line: updated });
    }
    catch (err) {
        return res.status(500).json({ error: 'Failed to update line', details: err.message });
    }
});
exports.transportRouter.delete('/lines/:id', auth_js_1.authenticate, auth_js_1.requireAdmin, async (_req, res) => {
    try {
        const ok = await store_js_1.store.deleteLine(_req.params.id);
        if (!ok)
            return res.status(404).json({ error: 'Line not found' });
        return res.json({ success: true, message: 'Line deleted' });
    }
    catch (err) {
        return res.status(500).json({ error: 'Failed to delete line', details: err.message });
    }
});
// --- Stations ---
exports.transportRouter.get('/stations', async (req, res) => {
    try {
        let stations = await store_js_1.store.getStations();
        const mode = req.query.mode;
        const search = req.query.search;
        const lineId = req.query.lineId;
        if (mode) {
            stations = stations.filter(s => s.mode === mode);
        }
        if (lineId) {
            stations = stations.filter(s => s.lineIds.includes(lineId));
        }
        if (search) {
            const q = search.toLowerCase();
            stations = stations.filter(s => s.name.toLowerCase().includes(q) ||
                (s.marathiName && s.marathiName.includes(q)) ||
                s.code.toLowerCase().includes(q));
        }
        return res.json({ stations });
    }
    catch (err) {
        return res.status(500).json({ error: 'Failed to fetch stations', details: err.message });
    }
});
exports.transportRouter.get('/stations/:id', async (req, res) => {
    try {
        const station = await store_js_1.store.getStationById(req.params.id);
        if (!station)
            return res.status(404).json({ error: 'Station not found' });
        return res.json({ station });
    }
    catch (err) {
        return res.status(500).json({ error: 'Failed to fetch station', details: err.message });
    }
});
exports.transportRouter.post('/stations', auth_js_1.authenticate, auth_js_1.requireAdmin, async (req, res) => {
    try {
        const parse = stationSchema.safeParse(req.body);
        if (!parse.success) {
            return res.status(400).json({ error: 'Invalid station data', details: parse.error.format() });
        }
        const created = await store_js_1.store.createStation(parse.data);
        return res.status(201).json({ station: created });
    }
    catch (err) {
        return res.status(500).json({ error: 'Failed to create station', details: err.message });
    }
});
exports.transportRouter.put('/stations/:id', auth_js_1.authenticate, auth_js_1.requireAdmin, async (req, res) => {
    try {
        const parse = stationSchema.partial().safeParse(req.body);
        if (!parse.success) {
            return res.status(400).json({ error: 'Invalid update data', details: parse.error.format() });
        }
        const updated = await store_js_1.store.updateStation(req.params.id, parse.data);
        if (!updated)
            return res.status(404).json({ error: 'Station not found' });
        return res.json({ station: updated });
    }
    catch (err) {
        return res.status(500).json({ error: 'Failed to update station', details: err.message });
    }
});
exports.transportRouter.delete('/stations/:id', auth_js_1.authenticate, auth_js_1.requireAdmin, async (req, res) => {
    try {
        const ok = await store_js_1.store.deleteStation(req.params.id);
        if (!ok)
            return res.status(404).json({ error: 'Station not found' });
        return res.json({ success: true, message: 'Station deleted' });
    }
    catch (err) {
        return res.status(500).json({ error: 'Failed to delete station', details: err.message });
    }
});

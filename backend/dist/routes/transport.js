import { Router } from 'express';
import { z } from 'zod';
import { store } from '../services/store.js';
import { authenticate, requireAdmin } from '../middleware/auth.js';
export const transportRouter = Router();
// Validation Schemas
const transitLineSchema = z.object({
    id: z.string().min(1),
    name: z.string().min(1),
    mode: z.enum(['train', 'metro', 'bus']),
    code: z.string().min(1),
    color: z.string().min(1),
    textColor: z.string().default('#ffffff'),
    operator: z.string().min(1),
    terminalA: z.string().min(1),
    terminalB: z.string().min(1),
    stationIds: z.array(z.string()).default([]),
    totalDistanceKm: z.number().nonnegative(),
    averageFrequencyMins: z.number().positive(),
    operatingHours: z.object({
        start: z.string(),
        end: z.string()
    })
});
const stationSchema = z.object({
    id: z.string().min(1),
    name: z.string().min(1),
    marathiName: z.string().optional(),
    code: z.string().min(1),
    mode: z.enum(['train', 'metro', 'bus']),
    lineIds: z.array(z.string()).default([]),
    latitude: z.number(),
    longitude: z.number(),
    zone: z.string().optional(),
    isInterchange: z.boolean().default(false),
    interchangeLines: z.array(z.string()).optional(),
    facilities: z.array(z.string()).optional(),
    averageDailyFootfall: z.number().optional()
});
// --- Lines ---
transportRouter.get('/lines', async (_req, res) => {
    try {
        const lines = await store.getLines();
        return res.json({ lines });
    }
    catch (err) {
        return res.status(500).json({ error: 'Failed to fetch lines', details: err.message });
    }
});
transportRouter.get('/lines/:id', async (req, res) => {
    try {
        const line = await store.getLineById(req.params.id);
        if (!line)
            return res.status(404).json({ error: 'Line not found' });
        return res.json({ line });
    }
    catch (err) {
        return res.status(500).json({ error: 'Failed to fetch line', details: err.message });
    }
});
transportRouter.post('/lines', authenticate, requireAdmin, async (req, res) => {
    try {
        const parse = transitLineSchema.safeParse(req.body);
        if (!parse.success) {
            return res.status(400).json({ error: 'Invalid line data', details: parse.error.format() });
        }
        const created = await store.createLine(parse.data);
        return res.status(201).json({ line: created });
    }
    catch (err) {
        return res.status(500).json({ error: 'Failed to create line', details: err.message });
    }
});
transportRouter.put('/lines/:id', authenticate, requireAdmin, async (req, res) => {
    try {
        const parse = transitLineSchema.partial().safeParse(req.body);
        if (!parse.success) {
            return res.status(400).json({ error: 'Invalid update data', details: parse.error.format() });
        }
        const updated = await store.updateLine(req.params.id, parse.data);
        if (!updated)
            return res.status(404).json({ error: 'Line not found' });
        return res.json({ line: updated });
    }
    catch (err) {
        return res.status(500).json({ error: 'Failed to update line', details: err.message });
    }
});
transportRouter.delete('/lines/:id', authenticate, requireAdmin, async (_req, res) => {
    try {
        const ok = await store.deleteLine(_req.params.id);
        if (!ok)
            return res.status(404).json({ error: 'Line not found' });
        return res.json({ success: true, message: 'Line deleted' });
    }
    catch (err) {
        return res.status(500).json({ error: 'Failed to delete line', details: err.message });
    }
});
// --- Stations ---
transportRouter.get('/stations', async (req, res) => {
    try {
        let stations = await store.getStations();
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
transportRouter.get('/stations/:id', async (req, res) => {
    try {
        const station = await store.getStationById(req.params.id);
        if (!station)
            return res.status(404).json({ error: 'Station not found' });
        return res.json({ station });
    }
    catch (err) {
        return res.status(500).json({ error: 'Failed to fetch station', details: err.message });
    }
});
transportRouter.post('/stations', authenticate, requireAdmin, async (req, res) => {
    try {
        const parse = stationSchema.safeParse(req.body);
        if (!parse.success) {
            return res.status(400).json({ error: 'Invalid station data', details: parse.error.format() });
        }
        const created = await store.createStation(parse.data);
        return res.status(201).json({ station: created });
    }
    catch (err) {
        return res.status(500).json({ error: 'Failed to create station', details: err.message });
    }
});
transportRouter.put('/stations/:id', authenticate, requireAdmin, async (req, res) => {
    try {
        const parse = stationSchema.partial().safeParse(req.body);
        if (!parse.success) {
            return res.status(400).json({ error: 'Invalid update data', details: parse.error.format() });
        }
        const updated = await store.updateStation(req.params.id, parse.data);
        if (!updated)
            return res.status(404).json({ error: 'Station not found' });
        return res.json({ station: updated });
    }
    catch (err) {
        return res.status(500).json({ error: 'Failed to update station', details: err.message });
    }
});
transportRouter.delete('/stations/:id', authenticate, requireAdmin, async (req, res) => {
    try {
        const ok = await store.deleteStation(req.params.id);
        if (!ok)
            return res.status(404).json({ error: 'Station not found' });
        return res.json({ success: true, message: 'Station deleted' });
    }
    catch (err) {
        return res.status(500).json({ error: 'Failed to delete station', details: err.message });
    }
});

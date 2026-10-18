"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.railradarRouter = void 0;
const express_1 = require("express");
const railradar_js_1 = require("../services/railradar.js");
exports.railradarRouter = (0, express_1.Router)();
// Search trains by number or name
exports.railradarRouter.get('/search', async (req, res) => {
    try {
        const q = req.query.q || '';
        if (!q || q.trim().length < 2) {
            return res.json({ trains: [] });
        }
        const trains = await railradar_js_1.railRadarService.searchTrains(q);
        return res.json({ success: true, count: trains.length, trains });
    }
    catch (err) {
        console.error('[RailRadar Route] Search error:', err);
        return res.status(500).json({ error: 'Search failed', details: err.message });
    }
});
// Live Running Status for a specific train
exports.railradarRouter.get('/live/:trainNumber', async (req, res) => {
    try {
        const { trainNumber } = req.params;
        if (!trainNumber) {
            return res.status(400).json({ error: 'Train number is required' });
        }
        const live = await railradar_js_1.railRadarService.getLiveStatus(trainNumber);
        return res.json({ success: true, live });
    }
    catch (err) {
        console.error('[RailRadar Route] Live status error:', err);
        return res.status(500).json({ error: 'Live status check failed', details: err.message });
    }
});
// Trains Between two stations (e.g. MMCT and BVI)
exports.railradarRouter.get('/between', async (req, res) => {
    try {
        const from = req.query.from || '';
        const to = req.query.to || '';
        if (!from || !to) {
            return res.status(400).json({ error: 'Both from and to station codes are required' });
        }
        const result = await railradar_js_1.railRadarService.getTrainsBetween(from, to);
        return res.json({ success: true, ...result });
    }
    catch (err) {
        console.error('[RailRadar Route] Between stations error:', err);
        return res.status(500).json({ error: 'Query between stations failed', details: err.message });
    }
});
// Curated Popular Mumbai Trains with live status
exports.railradarRouter.get('/popular', async (_req, res) => {
    try {
        const popular = await railradar_js_1.railRadarService.getPopularMumbaiTrains();
        return res.json({ success: true, count: popular.length, trains: popular });
    }
    catch (err) {
        console.error('[RailRadar Route] Popular trains error:', err);
        return res.status(500).json({ error: 'Failed to fetch popular trains', details: err.message });
    }
});
// Integration Status & Health
exports.railradarRouter.get('/status', (_req, res) => {
    return res.json({ success: true, status: railradar_js_1.railRadarService.getStatus() });
});

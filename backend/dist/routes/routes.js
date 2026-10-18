"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.routesRouter = void 0;
const express_1 = require("express");
const zod_1 = require("zod");
const routing_js_1 = require("../services/routing.js");
exports.routesRouter = (0, express_1.Router)();
const planRouteSchema = zod_1.z.object({
    fromStationId: zod_1.z.string().min(1, 'Source station is required'),
    toStationId: zod_1.z.string().min(1, 'Destination station is required'),
    modes: zod_1.z.array(zod_1.z.enum(['train', 'metro', 'bus'])).optional()
});
exports.routesRouter.post('/plan', async (req, res) => {
    try {
        const parse = planRouteSchema.safeParse(req.body);
        if (!parse.success) {
            return res.status(400).json({ error: 'Invalid route parameters', details: parse.error.format() });
        }
        const { fromStationId, toStationId, modes } = parse.data;
        if (fromStationId === toStationId) {
            return res.status(400).json({ error: 'Source and destination cannot be identical.' });
        }
        const allowedModes = (modes && modes.length > 0)
            ? modes
            : ['train', 'metro', 'bus'];
        const routes = await (0, routing_js_1.findRoutes)(fromStationId, toStationId, allowedModes);
        return res.json({
            fromStationId,
            toStationId,
            count: routes.length,
            routes
        });
    }
    catch (err) {
        console.error('Route calculation error:', err);
        return res.status(500).json({ error: 'Failed to compute routes', details: err.message });
    }
});

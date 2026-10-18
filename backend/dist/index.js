"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const auth_js_1 = require("./routes/auth.js");
const transport_js_1 = require("./routes/transport.js");
const crowd_js_1 = require("./routes/crowd.js");
const reports_js_1 = require("./routes/reports.js");
const routes_js_1 = require("./routes/routes.js");
const notifications_js_1 = require("./routes/notifications.js");
const railradar_js_1 = require("./routes/railradar.js");
dotenv_1.default.config();
const app = (0, express_1.default)();
const port = process.env.PORT || 5000;
// Middleware
app.use((0, cors_1.default)({
    origin: true, // Allow frontend dev server and production origins
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-mock-role']
}));
app.use(express_1.default.json());
// Request logger for transit API calls
app.use((req, _res, next) => {
    const timestamp = new Date().toISOString().substring(11, 19);
    console.log(`[${timestamp}] ${req.method} ${req.path}`);
    next();
});
// Health / Status endpoint
app.get('/api/health', (_req, res) => {
    res.json({
        status: 'ok',
        service: 'GoFlow Mumbai Transit API',
        version: '1.0.0',
        timestamp: new Date().toISOString()
    });
});
// Register routers
app.use('/api/auth', auth_js_1.authRouter);
app.use('/api/transport', transport_js_1.transportRouter);
app.use('/api/crowd', crowd_js_1.crowdRouter);
app.use('/api/reports', reports_js_1.reportsRouter);
app.use('/api/routes', routes_js_1.routesRouter);
app.use('/api/notifications', notifications_js_1.notificationsRouter);
app.use('/api/railradar', railradar_js_1.railradarRouter);
// Global 404 handler
app.use((_req, res) => {
    res.status(404).json({ error: 'Endpoint not found' });
});
// Global error handler
app.use((err, _req, res, _next) => {
    console.error('[Unhandled Server Error]:', err);
    res.status(500).json({
        error: 'Internal Server Error',
        message: process.env.NODE_ENV === 'development' ? err.message : 'An error occurred'
    });
});
app.listen(port, () => {
    console.log(`🚆 GoFlow API Server running at http://localhost:${port}`);
    console.log(`📍 Mumbai Suburban & Metro crowds monitored live`);
});

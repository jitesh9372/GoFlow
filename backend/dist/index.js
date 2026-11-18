import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { authRouter } from './routes/auth.js';
import { transportRouter } from './routes/transport.js';
import { crowdRouter } from './routes/crowd.js';
import { reportsRouter } from './routes/reports.js';
import { routesRouter } from './routes/routes.js';
import { notificationsRouter } from './routes/notifications.js';
import { railradarRouter } from './routes/railradar.js';
dotenv.config();
const app = express();
const port = process.env.PORT || 5000;
// Middleware
app.use(cors({
    origin: true, // Allow frontend dev server and production origins
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-mock-role']
}));
app.use(express.json());
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
app.use('/api/auth', authRouter);
app.use('/api/transport', transportRouter);
app.use('/api/crowd', crowdRouter);
app.use('/api/reports', reportsRouter);
app.use('/api/routes', routesRouter);
app.use('/api/notifications', notificationsRouter);
app.use('/api/railradar', railradarRouter);
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

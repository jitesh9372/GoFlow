"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.notificationsRouter = void 0;
const express_1 = require("express");
const zod_1 = require("zod");
const store_js_1 = require("../services/store.js");
const auth_js_1 = require("../middleware/auth.js");
exports.notificationsRouter = (0, express_1.Router)();
const createNotificationSchema = zod_1.z.object({
    title: zod_1.z.string().min(3),
    message: zod_1.z.string().min(5),
    severity: zod_1.z.enum(['info', 'warning', 'alert']),
    mode: zod_1.z.enum(['train', 'metro', 'bus']).optional(),
    lineId: zod_1.z.string().optional(),
    affectedStations: zod_1.z.array(zod_1.z.string()).optional(),
    authorName: zod_1.z.string().default('Transit Control')
});
exports.notificationsRouter.get('/', async (req, res) => {
    try {
        const onlyActive = req.query.all !== 'true';
        const notifications = await store_js_1.store.getNotifications(onlyActive);
        return res.json({ notifications });
    }
    catch (err) {
        return res.status(500).json({ error: 'Failed to fetch notifications', details: err.message });
    }
});
exports.notificationsRouter.post('/', auth_js_1.authenticate, auth_js_1.requireAdmin, async (req, res) => {
    try {
        const parse = createNotificationSchema.safeParse(req.body);
        if (!parse.success) {
            return res.status(400).json({ error: 'Invalid notification data', details: parse.error.format() });
        }
        const created = await store_js_1.store.createNotification({
            ...parse.data,
            authorName: req.user?.displayName || parse.data.authorName
        });
        return res.status(201).json({ notification: created });
    }
    catch (err) {
        return res.status(500).json({ error: 'Failed to create notification', details: err.message });
    }
});
exports.notificationsRouter.delete('/:id', auth_js_1.authenticate, auth_js_1.requireAdmin, async (req, res) => {
    try {
        const ok = await store_js_1.store.dismissNotification(req.params.id);
        if (!ok)
            return res.status(404).json({ error: 'Notification not found' });
        return res.json({ success: true, message: 'Notification dismissed' });
    }
    catch (err) {
        return res.status(500).json({ error: 'Failed to dismiss notification', details: err.message });
    }
});

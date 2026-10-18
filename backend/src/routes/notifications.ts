import { Router, Response } from 'express';
import { z } from 'zod';
import { store } from '../services/store.js';
import { authenticate, requireAdmin, AuthenticatedRequest } from '../middleware/auth.js';

export const notificationsRouter = Router();

const createNotificationSchema = z.object({
  title: z.string().min(3),
  message: z.string().min(5),
  severity: z.enum(['info', 'warning', 'alert']),
  mode: z.enum(['train', 'metro', 'bus']).optional(),
  lineId: z.string().optional(),
  affectedStations: z.array(z.string()).optional(),
  authorName: z.string().default('Transit Control')
});

notificationsRouter.get('/', async (req, res: Response) => {
  try {
    const onlyActive = req.query.all !== 'true';
    const notifications = await store.getNotifications(onlyActive);
    return res.json({ notifications });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to fetch notifications', details: err.message });
  }
});

notificationsRouter.post('/', authenticate, requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const parse = createNotificationSchema.safeParse(req.body);
    if (!parse.success) {
      return res.status(400).json({ error: 'Invalid notification data', details: parse.error.format() });
    }

    const created = await store.createNotification({
      ...parse.data,
      authorName: req.user?.displayName || parse.data.authorName
    });

    return res.status(201).json({ notification: created });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to create notification', details: err.message });
  }
});

notificationsRouter.delete('/:id', authenticate, requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const ok = await store.dismissNotification(req.params.id);
    if (!ok) return res.status(404).json({ error: 'Notification not found' });
    return res.json({ success: true, message: 'Notification dismissed' });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to dismiss notification', details: err.message });
  }
});

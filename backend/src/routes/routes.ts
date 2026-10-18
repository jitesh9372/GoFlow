import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { findRoutes } from '../services/routing.js';
import { TransportMode } from '../types/index.js';

export const routesRouter = Router();

const planRouteSchema = z.object({
  fromStationId: z.string().min(1, 'Source station is required'),
  toStationId: z.string().min(1, 'Destination station is required'),
  modes: z.array(z.enum(['train', 'metro', 'bus'])).optional()
});

routesRouter.post('/plan', async (req: Request, res: Response) => {
  try {
    const parse = planRouteSchema.safeParse(req.body);
    if (!parse.success) {
      return res.status(400).json({ error: 'Invalid route parameters', details: parse.error.format() });
    }

    const { fromStationId, toStationId, modes } = parse.data;

    if (fromStationId === toStationId) {
      return res.status(400).json({ error: 'Source and destination cannot be identical.' });
    }

    const allowedModes: TransportMode[] = (modes && modes.length > 0)
      ? modes
      : ['train', 'metro', 'bus'];

    const routes = await findRoutes(fromStationId, toStationId, allowedModes);

    return res.json({
      fromStationId,
      toStationId,
      count: routes.length,
      routes
    });
  } catch (err: any) {
    console.error('Route calculation error:', err);
    return res.status(500).json({ error: 'Failed to compute routes', details: err.message });
  }
});

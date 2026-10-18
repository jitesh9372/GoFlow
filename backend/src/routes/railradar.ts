import { Router, Request, Response } from 'express';
import { railRadarService } from '../services/railradar.js';

export const railradarRouter = Router();

// Search trains by number or name
railradarRouter.get('/search', async (req: Request, res: Response) => {
  try {
    const q = (req.query.q as string) || '';
    if (!q || q.trim().length < 2) {
      return res.json({ trains: [] });
    }
    const trains = await railRadarService.searchTrains(q);
    return res.json({ success: true, count: trains.length, trains });
  } catch (err: any) {
    console.error('[RailRadar Route] Search error:', err);
    return res.status(500).json({ error: 'Search failed', details: err.message });
  }
});

// Live Running Status for a specific train
railradarRouter.get('/live/:trainNumber', async (req: Request, res: Response) => {
  try {
    const { trainNumber } = req.params;
    if (!trainNumber) {
      return res.status(400).json({ error: 'Train number is required' });
    }
    const live = await railRadarService.getLiveStatus(trainNumber);
    return res.json({ success: true, live });
  } catch (err: any) {
    console.error('[RailRadar Route] Live status error:', err);
    return res.status(500).json({ error: 'Live status check failed', details: err.message });
  }
});

// Trains Between two stations (e.g. MMCT and BVI)
railradarRouter.get('/between', async (req: Request, res: Response) => {
  try {
    const from = (req.query.from as string) || '';
    const to = (req.query.to as string) || '';
    if (!from || !to) {
      return res.status(400).json({ error: 'Both from and to station codes are required' });
    }
    const result = await railRadarService.getTrainsBetween(from, to);
    return res.json({ success: true, ...result });
  } catch (err: any) {
    console.error('[RailRadar Route] Between stations error:', err);
    return res.status(500).json({ error: 'Query between stations failed', details: err.message });
  }
});

// Curated Popular Mumbai Trains with live status
railradarRouter.get('/popular', async (_req: Request, res: Response) => {
  try {
    const popular = await railRadarService.getPopularMumbaiTrains();
    return res.json({ success: true, count: popular.length, trains: popular });
  } catch (err: any) {
    console.error('[RailRadar Route] Popular trains error:', err);
    return res.status(500).json({ error: 'Failed to fetch popular trains', details: err.message });
  }
});

// Integration Status & Health
railradarRouter.get('/status', (_req: Request, res: Response) => {
  return res.json({ success: true, status: railRadarService.getStatus() });
});

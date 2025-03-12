import type { Provider } from 'nconf';
import type { BeatmapService } from '../services/BeatmapService';
import { Router } from 'express';

export function create(config: Provider, beatmapService: BeatmapService) {
  const router = Router();

  router.get('/api/place', (req, res) => {
    const timeRemaining = 60_000;

    res.json({
      timeRemaining,
      totalCountdown: 120_000,
    });
  });

  return router;
}

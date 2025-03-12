import type { Provider } from 'nconf';
import type { BeatmapService } from '../services/BeatmapService';
import express, { Router } from 'express';

export function create(config: Provider, beatmapService: BeatmapService) {
  const router = Router();

  router.get('/api/beatmap', (req, res) => {
    res.json({
      summary: beatmapService.beatmap.createSummary(),
      version: beatmapService.sequenceNumber,
    });
  });

  router.use('/api/beatmap/assets', express.static(config.get('storage')));

  return router;
}

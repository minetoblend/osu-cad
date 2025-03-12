import type { Provider } from 'nconf';
import type { PlaceServerResources } from '../PlaceServerResources';
import express, { Router } from 'express';

export function create(config: Provider, { beatmapService }: PlaceServerResources) {
  const router = Router();

  router.get('/api/beatmap', (req, res) => {
    res.json({
      summary: beatmapService.beatmap.createSummary(),
    });
  });

  router.use('/api/beatmap/assets', express.static(config.get('storage')));

  return router;
}

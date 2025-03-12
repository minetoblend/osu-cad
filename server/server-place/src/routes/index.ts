import type { Router } from 'express';
import type { Provider } from 'nconf';
import type { BeatmapService } from '../services/BeatmapService';
import * as beatmap from './beatmap';

export interface IRoutes {
  beatmap: Router;
}

export function create(
  config: Provider,
  beatmapService: BeatmapService,
): IRoutes {
  return {
    beatmap: beatmap.create(config, beatmapService),
  };
}

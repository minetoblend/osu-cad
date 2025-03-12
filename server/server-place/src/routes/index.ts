import type { Router } from 'express';
import type { Provider } from 'nconf';
import type { BeatmapService } from '../services/BeatmapService';
import * as beatmap from './beatmap';
import * as place from './place';

export interface IRoutes {
  beatmap: Router;
  place: Router;
}

export function create(
  config: Provider,
  beatmapService: BeatmapService,
): IRoutes {
  return {
    beatmap: beatmap.create(config, beatmapService),
    place: place.create(config, beatmapService),
  };
}

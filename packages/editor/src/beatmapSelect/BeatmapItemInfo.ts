import type { IResourcesProvider } from '@osucad/common';
import type { Action } from 'osucad-framework';
import type { Texture } from 'pixi.js';
import type { LoadedBeatmap } from '../beatmap/LoadedBeatmap';
import type { MapsetInfo } from './MapsetInfo';

export interface BeatmapItemInfo {
  readonly invalidated: Action;

  readonly id: string;

  readonly setId: string;

  readonly authorName: string;

  readonly artist: string;

  readonly title: string;

  readonly difficultyName: string;

  readonly starRating: number;

  backgroundPath: () => Promise<string | null>;

  loadThumbnailSmall: () => Promise<Texture | null>;

  loadThumbnailLarge: () => Promise<Texture | null>;

  readonly audioUrl: string;

  readonly lastEdited: Date | null;

  readonly previewPoint: number | null;

  load(resources: IResourcesProvider): Promise<LoadedBeatmap>;

  mapset: MapsetInfo | null;

  readonly needsDiffcalc?: boolean;
}

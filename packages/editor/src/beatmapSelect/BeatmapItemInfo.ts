import type { UserInfo } from '@osucad/common';
import type { Texture } from 'pixi.js';
import type { LoadedBeatmap } from '../beatmap/LoadedBeatmap.ts';
import type { IResourcesProvider } from '../io/IResourcesProvider';
import type { MapsetInfo } from './MapsetInfo.ts';

export interface BeatmapItemInfo {
  readonly id: string;

  readonly setId: string;

  readonly author: UserInfo | null;

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
}

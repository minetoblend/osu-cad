import type { Texture } from 'pixi.js';
import type { CarouselBeatmapSetInfo } from './CarouselBeatmapSetInfo';

export interface CarouselBeatmapInfo {
  readonly id: string;

  readonly setId: string;

  readonly authorName: string;

  readonly artist: string;

  readonly title: string;

  readonly difficultyName: string;

  readonly starRating: number;

  loadThumbnailSmall: () => Promise<Texture | null>;

  loadThumbnailLarge: () => Promise<Texture | null>;

  readonly audioUrl: string;

  readonly lastEdited: Date | null;

  readonly previewPoint: number | null;

  mapset: CarouselBeatmapSetInfo | null;

  select: () => void;
}

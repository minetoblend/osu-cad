import type { Texture } from 'pixi.js';
import type { CarouselBeatmapInfo } from './CarouselBeatmapInfo';

export interface CarouselBeatmapSetInfo {
  id: string;

  artist: string;

  title: string;

  authorName: string;

  beatmaps: CarouselBeatmapInfo[];

  loadThumbnailSmall: () => Promise<Texture | null>;

  loadThumbnailLarge: () => Promise<Texture | null>;
}

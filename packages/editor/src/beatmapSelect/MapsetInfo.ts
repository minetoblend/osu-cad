import type { UserInfo } from '@osucad/common';
import type { Texture } from 'pixi.js';
import type { BeatmapItemInfo } from './BeatmapItemInfo';

export interface MapsetInfo {
  id: string;

  artist: string;

  title: string;

  author: UserInfo | null;

  authorName: string;

  beatmaps: BeatmapItemInfo[];

  loadThumbnailSmall: () => Promise<Texture | null>;

  loadThumbnailLarge: () => Promise<Texture | null>;
}

import type { UserInfo } from '@osucad/common';
import type { BeatmapInfo } from './BeatmapInfo';

export interface MapsetInfo {
  id: string;

  artist: string;

  title: string;

  creator: UserInfo;

  beatmaps: BeatmapInfo[];

  thumbnailLarge: string | null;

  thumbnailSmall: string | null;
}

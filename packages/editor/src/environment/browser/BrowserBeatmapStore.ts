import type { BeatmapInfo as BeatmapInfoDto } from '@osucad/common';
import { BeatmapStore } from '../BeatmapStore';
import type { BeatmapItemInfo } from '../../beatmapSelect/BeatmapItemInfo';
import { OnlineBeatmapInfo } from '../../beatmap/OnlineBeatmapInfo';

export class BrowserBeatmapStore extends BeatmapStore {
  async loadBeatmaps(): Promise<BeatmapItemInfo[]> {
    const response = await fetch('/api/beatmaps?sort=recent&filter=own', {
      method: 'GET',
      priority: 'high',
      credentials: 'same-origin',
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch beatmaps: ${response.status} ${response.statusText}`);
    }

    const beatmaps = await response.json() as BeatmapInfoDto[];

    return beatmaps.map(b => new OnlineBeatmapInfo(b));
  }
}

import { Bindable } from 'osucad-framework';
import type { BeatmapItemInfo } from '../beatmapSelect/BeatmapItemInfo';

export abstract class BeatmapStore {
  abstract loadBeatmaps(): Promise<BeatmapItemInfo[]>;

  loading = new Bindable(false);
  beatmaps = new Bindable([] as BeatmapItemInfo[]);

  async init() {
    try {
      this.beatmaps.value = await this.loadBeatmaps();
    }
    finally {
      this.loading.value = false;
    }
  }
}

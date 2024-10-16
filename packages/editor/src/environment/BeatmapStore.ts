import type { StableBeatmapInfo } from 'osucad/src/renderer/src/StableBeatmapStore';
import type { IBeatmap } from '../beatmap/IBeatmap';
import type { BeatmapItemInfo } from '../beatmapSelect/BeatmapItemInfo';
import { Action, Bindable, BindableBoolean } from 'osucad-framework';

export abstract class BeatmapStore {
  beatmaps = new Bindable<BeatmapItemInfo[]>([]);

  added = new Action<StableBeatmapInfo>();

  removed = new Action<StableBeatmapInfo>();

  isImporting = new BindableBoolean(false);

  diffcalcActive = new BindableBoolean(false);

  abstract save(
    id: string,
    beatmap: IBeatmap,
  ): Promise<boolean>;
}

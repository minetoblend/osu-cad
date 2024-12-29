import type { IBeatmap } from '@osucad/common';
import type { BeatmapItemInfo } from '../beatmapSelect/BeatmapItemInfo';
import { Action, Bindable, BindableBoolean } from 'osucad-framework';

export abstract class BeatmapStore {
  beatmaps = new Bindable<BeatmapItemInfo[]>([]);

  added = new Action<BeatmapItemInfo>();

  removed = new Action<BeatmapItemInfo>();

  isImporting = new BindableBoolean(false);

  diffcalcActive = new BindableBoolean(false);

  abstract save(
    id: string,
    beatmap: IBeatmap,
  ): Promise<boolean>;
}

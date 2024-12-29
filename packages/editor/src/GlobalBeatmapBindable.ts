import type { BeatmapItemInfo } from './beatmapSelect/BeatmapItemInfo';
import { Bindable } from 'osucad-framework';

export class GlobalBeatmapBindable extends Bindable<BeatmapItemInfo | null> {
  createInstance(): Bindable<BeatmapItemInfo | null> {
    return new GlobalBeatmapBindable(null);
  }
}

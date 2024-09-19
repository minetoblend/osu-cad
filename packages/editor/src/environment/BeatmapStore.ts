import type { BeatmapItemInfo } from '../beatmapSelect/BeatmapItemInfo';
import { Bindable } from 'osucad-framework';

export abstract class BeatmapStore {
  beatmaps = new Bindable<BeatmapItemInfo[]>([]);
}

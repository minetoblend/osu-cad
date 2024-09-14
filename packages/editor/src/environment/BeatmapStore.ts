import { Bindable } from 'osucad-framework';
import type { BeatmapItemInfo } from '../beatmapSelect/BeatmapItemInfo';

export abstract class BeatmapStore {
  beatmaps = new Bindable<BeatmapItemInfo[]>([]);
}

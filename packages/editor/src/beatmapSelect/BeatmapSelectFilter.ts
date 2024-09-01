import { Bindable } from 'osucad-framework';
import type { BeatmapItemInfo } from './BeatmapItemInfo';

export class BeatmapSelectFilter {
  constructor(
    readonly beatmaps: Bindable<BeatmapItemInfo[]>,
  ) {
  }

  searchTerm = new Bindable('');

  readonly filteredBeatmaps = new Bindable<BeatmapItemInfo[]>([]);
}

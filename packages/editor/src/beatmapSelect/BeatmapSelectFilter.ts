import type { ScheduledDelegate } from 'osucad-framework';
import type { BeatmapItemInfo } from './BeatmapItemInfo';
import { Bindable, Component } from 'osucad-framework';

import { BeatmapSearchIndex } from './BeatmapSearchIndex.ts';

export class BeatmapSelectFilter extends Component {
  constructor(
    readonly beatmaps: Bindable<BeatmapItemInfo[]>,
  ) {
    super();

    for (const beatmap of beatmaps.value)
      this.#index.add(beatmap);

    this.#index.build()

    this.searchTerm.addOnChangeListener(() => {
      if (this.#scheduledDelegate)
        this.#scheduledDelegate.cancel();
      this.#scheduledDelegate = this.scheduler.addDelayed(() => this.updateFilter(), 100);
    });

    this.updateFilter();
  }

  #index = new BeatmapSearchIndex();

  searchTerm = new Bindable('');

  beatmapMap = new Map<string, BeatmapItemInfo>();

  readonly visibleBeatmaps = new Bindable<Set<string> | null>(null);

  #scheduledDelegate: ScheduledDelegate | null = null;

  updateFilter() {
    const term = this.searchTerm.value.trim();

    if (term.length === 0) {
      this.visibleBeatmaps.value = null;
      return;
    }

    this.visibleBeatmaps.value = new Set(this.#index.search(this.searchTerm.value).map(it => it.id));
  }
}

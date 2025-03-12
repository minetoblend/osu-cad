import type { Beatmap } from '@osucad/core';
import type { ReadonlyDependencyContainer } from '@osucad/framework';
import { BoxedBeatmap, SimpleFile, StaticFileStore } from '@osucad/core';
import { Bindable, Component } from '@osucad/framework';
import { PlaceBeatmap } from './PlaceBeatmap';

export class PlaceClient extends Component {
  protected override get hasAsyncLoader(): boolean {
    return true;
  }

  protected override async loadAsync(dependencies: ReadonlyDependencyContainer): Promise<void> {
    await Promise.all([
      this.loadBeatmap(),
      this.loadPlacementState(),
      super.loadAsync(dependencies),
    ]);
  }

  async loadBeatmap() {
    const { summary, version } = await fetch('/api/beatmap').then(res => res.json());

    const beatmap = new BoxedBeatmap();
    beatmap.initializeFromSummary(summary);

    const assets = beatmap.assets!.map(it => new SimpleFile(
      it.path,
      () => fetch(`/api/beatmap/assets/${it.id}`).then(it => it.arrayBuffer()),
    ));

    this.beatmap = new PlaceBeatmap(
      beatmap.beatmap as Beatmap,
      new StaticFileStore(assets),
      this,
    );
  }

  async loadPlacementState() {
    const { timeRemaining, totalCountdown } = await fetch('/api/place').then(res => res.json());

    this.countdownEndTime.value = {
      endTime: this.time.current + timeRemaining,
      totalTime: totalCountdown,
    };
  }

  readonly countdownEndTime = new Bindable<{
    endTime: number;
    totalTime: number;
  } | null>(null);

  beatmap!: PlaceBeatmap;
}

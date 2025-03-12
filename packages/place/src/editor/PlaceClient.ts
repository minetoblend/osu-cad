import type { Beatmap } from '@osucad/core';
import { BoxedBeatmap, SimpleFile, StaticFileStore } from '@osucad/core';
import { PlaceBeatmap } from './PlaceBeatmap';

export class PlaceClient {
  constructor() {
  }

  async load() {
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

  beatmap!: PlaceBeatmap;
}

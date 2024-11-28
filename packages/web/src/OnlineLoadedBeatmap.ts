import type { IResourceStore } from 'osucad-framework';
import { type IBeatmap, StableBeatmapParser } from '@osucad/common';
import { LoadedBeatmap } from '@osucad/editor';

export class OnlineLoadedBeatmap extends LoadedBeatmap {
  constructor(
    readonly resources: IResourceStore<ArrayBuffer>,
  ) {
    super();
  }

  protected async loadSourceBeatmap(): Promise<IBeatmap> {
    const response = await fetch('/edit/beatmap');

    return new StableBeatmapParser().parse(await response.text());
  }
}

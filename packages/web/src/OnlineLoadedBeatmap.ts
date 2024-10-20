import type { IBeatmap, IResourceStore } from '@osucad/editor';
import { LoadedBeatmap, StableBeatmapParser } from '@osucad/editor';

export class OnlineLoadedBeatmap extends LoadedBeatmap {
  constructor(
    readonly resources: IResourceStore<ArrayBuffer>,
  ) {
    super();
  }

  protected async loadSourceBeatmap(): Promise<IBeatmap> {
    const response = await fetch('/edit/beatmap');

    return await new StableBeatmapParser().parse(await response.text());
  }
}

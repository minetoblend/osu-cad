import type { Beatmap, IFileStore } from '@osucad/core';
import type { PlaceClient } from './PlaceClient';
import { EditorBeatmap } from '@osucad/core';

export class PlaceBeatmap extends EditorBeatmap {
  constructor(beatmap: Beatmap, fileStore: IFileStore, readonly client: PlaceClient) {
    super(beatmap, fileStore);
  }
}

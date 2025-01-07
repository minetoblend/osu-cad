import type { Beatmap, HitObject, IFileStore, WorkingBeatmapSet } from '@osucad/common';
import type { MultiplayerClient } from './MultiplayerClient';
import { EditorBeatmap } from '@osucad/common';

export class MultiplayerEditorBeatmap<T extends HitObject = HitObject> extends EditorBeatmap<T> {
  constructor(
    readonly client: MultiplayerClient,
    beatmap: Beatmap<T>,
    fileStore: IFileStore,
    beatmapSet?: WorkingBeatmapSet,
  ) {
    super(beatmap, fileStore, beatmapSet);
  }
}

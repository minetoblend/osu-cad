import type { BeatmapAssetManager, IBeatmap } from '@osucad/common';
import type { MultiplayerClient } from './MultiplayerClient';
import { EditorBeatmap } from '@osucad/common';

export class MultiplayerEditorBeatmap extends EditorBeatmap {
  constructor(
    override readonly beatmap: IBeatmap,
    override readonly assets: BeatmapAssetManager,
    readonly client: MultiplayerClient,
  ) {
    super();
  }
}

import type { BeatmapAssetManager, IBeatmap } from '@osucad/common';
import { EditorBeatmap } from '@osucad/common';

export class MultiplayerEditorBeatmap extends EditorBeatmap {
  constructor(
    override readonly beatmap: IBeatmap,
    override readonly assets: BeatmapAssetManager,
  ) {
    super();
  }
}

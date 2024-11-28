import type { BeatmapAssetManager, EditorBeatmap, IBeatmap } from '@osucad/common';

export class MultiplayerEditorBeatmap extends EditorBeatmap {
  constructor(
    override readonly beatmap: IBeatmap,
    override readonly assets: BeatmapAssetManager,
  ) {
    super();
  }
}

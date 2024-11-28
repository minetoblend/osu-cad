import type { IBeatmap } from '@osucad/common';
import type { BeatmapAssetManager } from './BeatmapAssetManager';
import { EditorBeatmap } from './EditorBeatmap';

export class MultiplayerEditorBeatmap extends EditorBeatmap {
  constructor(
    override readonly beatmap: IBeatmap,
    readonly assets: BeatmapAssetManager,
  ) {
    super();
  }
}

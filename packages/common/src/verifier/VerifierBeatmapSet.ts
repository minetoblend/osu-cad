import type { IBeatmap } from '../beatmap/IBeatmap';
import type { FileStore } from '../beatmap/io/FileStore';
import type { BeatmapSkin } from '../skinning/BeatmapSkin';

export class VerifierBeatmapSet {
  constructor(
    readonly beatmaps: IBeatmap[],
    readonly fileStore: FileStore,
    readonly skin: BeatmapSkin,
  ) {
  }
}

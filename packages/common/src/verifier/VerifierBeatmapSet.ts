import type { IBeatmap } from '../beatmap/IBeatmap';
import type { FileStore } from '../beatmap/io/FileStore';

export class VerifierBeatmapSet {
  constructor(
    readonly beatmaps: IBeatmap,
    readonly fileStore: FileStore,
  ) {
  }
}

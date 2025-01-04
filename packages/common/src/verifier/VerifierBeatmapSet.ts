import type { IBeatmap } from '../beatmap/IBeatmap';
import type { FileStore } from '../beatmap/io/FileStore';
import type { IResourcesProvider } from '../io/IResourcesProvider';
import type { BeatmapSkin } from '../skinning/BeatmapSkin';

export class VerifierBeatmapSet {
  constructor(
    readonly beatmaps: readonly IBeatmap[],
    readonly fileStore: FileStore,
    readonly skin: BeatmapSkin,
    readonly resourcesProvider: IResourcesProvider,
  ) {
  }

  getAudioPath() {
    return this.beatmaps.find(it => it.settings.audioFileName.length > 0)?.settings.audioFileName ?? null;
  }
}

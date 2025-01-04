import type { IBeatmap } from '../beatmap/IBeatmap';
import type { FileStore } from '../beatmap/io/FileStore';
import type { HitObject } from '../hitObjects/HitObject';
import type { IResourcesProvider } from '../io/IResourcesProvider';
import type { BeatmapSkin } from '../skinning/BeatmapSkin';
import type { BeatmapCheck } from './BeatmapCheck';
import type { BeatmapSetCheck } from './BeatmapSetCheck';
import type { Issue } from './Issue';
import { VerifierBeatmap } from './VerifierBeatmap';
import { VerifierBeatmapSet } from './VerifierBeatmapSet';

export abstract class BeatmapVerifier<T extends HitObject = HitObject> {
  abstract get beatmapChecks(): BeatmapCheck<T>[];

  abstract get beatmapSetChecks(): BeatmapSetCheck[];

  async * getIssues(
    beatmaps: readonly IBeatmap<any>[],
    fileStore: FileStore,
    skin: BeatmapSkin,
    resources: IResourcesProvider,
  ): AsyncGenerator<Issue, void, undefined> {
    for (const beatmap of beatmaps) {
      const verifierBeatmap = new VerifierBeatmap(beatmap, fileStore);
      for (const check of this.beatmapChecks)
        yield * check.getIssues(verifierBeatmap);
    }

    await skin.load();

    const beatmapSet = new VerifierBeatmapSet(beatmaps, fileStore, skin, resources);

    for (const check of this.beatmapSetChecks)
      yield * check.getIssues(beatmapSet);
  }
}

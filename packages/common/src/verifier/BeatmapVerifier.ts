import type { IBeatmap } from '../beatmap/IBeatmap';
import type { FileStore } from '../beatmap/io/FileStore';
import type { HitObject } from '../hitObjects/HitObject';
import type { BeatmapCheck } from './BeatmapCheck';
import type { Issue } from './Issue';
import { VerifierBeatmap } from './VerifierBeatmap';

export abstract class BeatmapVerifier<T extends HitObject = HitObject> {
  abstract get beatmapChecks(): BeatmapCheck<T>[];

  * getIssues(beatmap: IBeatmap<T>, fileStore: FileStore): Generator<Issue, void, undefined> {
    const verifierBeatmap = new VerifierBeatmap(beatmap, fileStore);
    for (const check of this.beatmapChecks)
      yield * check.getIssues(verifierBeatmap);
  }
}

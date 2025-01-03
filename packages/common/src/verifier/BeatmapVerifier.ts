import type { IBeatmap } from '../beatmap/IBeatmap';
import type { HitObject } from '../hitObjects/HitObject';
import type { BeatmapCheck } from './BeatmapCheck';
import type { Issue } from './Issue';
import { VerifierBeatmap } from './VerifierBeatmap';

export abstract class BeatmapVerifier<T extends HitObject = HitObject> {
  constructor() {
  }

  abstract get beatmapChecks(): BeatmapCheck<T>[];

  * getIssues(beatmap: IBeatmap<T>): Generator<Issue, void, undefined> {
    const verifierBeatmap = new VerifierBeatmap(beatmap, this);
    for (const check of this.beatmapChecks)
      yield * check.getIssues(verifierBeatmap);
  }
}

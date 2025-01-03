import type { EditorBeatmap } from '../editor/EditorBeatmap';
import type { HitObject } from '../hitObjects/HitObject';
import type { BeatmapCheck } from './BeatmapCheck';
import type { Issue } from './Issue';

export abstract class BeatmapVerifier<T extends HitObject = HitObject> {
  abstract get checks(): BeatmapCheck<T>[];

  * getIssues(beatmap: EditorBeatmap<T>): Generator<Issue, void, undefined> {
    for (const check of this.checks) {
      yield * check.getIssues(beatmap);
    }
  }
}

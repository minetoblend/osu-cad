import type { EditorBeatmap } from '../editor/EditorBeatmap';
import type { HitObject } from '../hitObjects/HitObject';
import type { BeatmapCheck } from './BeatmapCheck';
import type { BeatmapSetCheck } from './BeatmapSetCheck';
import type { Issue } from './Issue';

export abstract class BeatmapVerifier<T extends HitObject = HitObject> {
  abstract get beatmapChecks(): BeatmapCheck<T>[];

  abstract get beatmapSetChecks(): BeatmapSetCheck[];

  * getIssues(beatmap: EditorBeatmap<T>): Generator<Issue, void, undefined> {
    for (const check of this.beatmapChecks)
      yield * check.getIssues(beatmap);
  }
}

import type { EditorBeatmap } from '../editor/EditorBeatmap';
import type { BeatmapCheck } from './BeatmapCheck';
import type { Issue } from './Issue';

export abstract class BeatmapVerifier {
  abstract get checks(): BeatmapCheck[];

  * getIssues(beatmap: EditorBeatmap): Generator<Issue, void, undefined> {
    for (const check of this.checks) {
      const result = check.check(beatmap);

      if (Array.isArray(result))
        yield * result;
      else if (result)
        yield result;
    }
  }
}

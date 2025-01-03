import type { IBeatmap } from '../beatmap/IBeatmap';
import type { EditorBeatmap } from '../editor/EditorBeatmap';
import type { HitObject } from '../hitObjects/HitObject';
import type { BeatmapCheck } from './BeatmapCheck';
import type { BeatmapSetCheck } from './BeatmapSetCheck';
import type { Issue } from './Issue';

export abstract class BeatmapVerifier<T extends HitObject = HitObject> {
  constructor(readonly editorBeatmap: EditorBeatmap) {
  }

  abstract get beatmapChecks(): BeatmapCheck<T>[];

  abstract get beatmapSetChecks(): BeatmapSetCheck[];

  * getIssues(): Generator<Issue, void, undefined> {
    for (const check of this.beatmapChecks)
      yield * check.getIssues(this.editorBeatmap.beatmap as unknown as IBeatmap<T>);
  }
}

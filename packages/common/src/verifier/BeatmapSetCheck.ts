import type { WorkingBeatmapSet } from '../beatmap/workingBeatmap/WorkingBeatmapSet';
import type { Issue } from './Issue';

export abstract class BeatmapSetCheck {
  abstract getIssues(mapset: WorkingBeatmapSet): AsyncGenerator<Promise<Issue>, void, undefined>;
}

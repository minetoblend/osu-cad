import type { Issue } from './Issue';
import type { VerifierBeatmapSet } from './VerifierBeatmapSet';

export abstract class BeatmapSetCheck {
  abstract getIssues(mapset: VerifierBeatmapSet): AsyncGenerator<Promise<Issue>, void, undefined>;
}

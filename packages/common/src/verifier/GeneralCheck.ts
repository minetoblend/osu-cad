import type { Issue } from './Issue';
import type { VerifierBeatmapSet } from './VerifierBeatmapSet';
import { Check } from './Check';

export abstract class GeneralCheck extends Check {
  abstract getIssues(mapset: VerifierBeatmapSet): AsyncGenerator<Issue, void, undefined>;
}

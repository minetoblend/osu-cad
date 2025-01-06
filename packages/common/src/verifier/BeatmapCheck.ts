import type { HitObject } from '../hitObjects/HitObject';
import type { Issue } from './Issue';
import type { DifficultyType, VerifierBeatmap } from './VerifierBeatmap';
import { Check } from './Check';

export interface CheckMetadata {
  readonly category: string;
  readonly message: string;
  readonly author: string;
  readonly documentation?: { title: string; description: string }[];
  readonly difficulties?: DifficultyType[];
}

export abstract class BeatmapCheck<T extends HitObject = HitObject> extends Check {
  abstract getIssues(beatmap: VerifierBeatmap<T>): AsyncGenerator<Issue, void, undefined>;
}

import type { HitObject } from '../hitObjects/HitObject';
import type { Issue } from './Issue';
import type { VerifierBeatmap } from './VerifierBeatmap';

export abstract class BeatmapCheck<T extends HitObject = HitObject> {
  abstract getIssues(beatmap: VerifierBeatmap<T>): Generator<Issue, void, undefined>;
}

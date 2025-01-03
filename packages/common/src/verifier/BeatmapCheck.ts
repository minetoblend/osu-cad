import type { IBeatmap } from '../beatmap/IBeatmap';
import type { HitObject } from '../hitObjects/HitObject';
import type { Issue } from './Issue';

export abstract class BeatmapCheck<T extends HitObject = HitObject> {
  abstract check(beatmap: IBeatmap<T>): Generator<Issue, void, undefined>;
}

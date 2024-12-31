import type { EditorBeatmap } from '../editor/EditorBeatmap';
import type { HitObject } from '../hitObjects/HitObject';
import type { Issue } from './Issue';

export abstract class BeatmapCheck<T extends HitObject = HitObject> {
  abstract check(beatmap: EditorBeatmap<T>): Generator<Issue, void, undefined>;
}

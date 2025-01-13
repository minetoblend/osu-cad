import type { HitObject } from '../../../../hitObjects/HitObject';
import type { EditorBeatmap } from '../../../EditorBeatmap';
import type { EditorClock } from '../../../EditorClock';

export interface OperatorContext<TObject extends HitObject = any> {
  beatmap: EditorBeatmap<TObject>;
  clock: EditorClock;
}

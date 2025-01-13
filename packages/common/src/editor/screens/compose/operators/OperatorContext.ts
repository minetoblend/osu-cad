import type { HitObject } from '../../../../hitObjects/HitObject';
import type { EditorBeatmap } from '../../../EditorBeatmap';

export interface OperatorContext<TObject extends HitObject = any> {
  beatmap: EditorBeatmap<TObject>;
}

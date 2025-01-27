import type { Vec2 } from '../../math/Vec2';
import { CompositeDrawable } from '../containers/CompositeDrawable';

export abstract class Caret extends CompositeDrawable {
  abstract displayAt(position: Vec2, selectionWidth: number | null): void;
}

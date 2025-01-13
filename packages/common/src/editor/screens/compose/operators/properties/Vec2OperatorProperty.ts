import type { Drawable, Vec2 } from 'osucad-framework';
import type { OperatorPropertyOptions } from './OperatorProperty';
import { DrawableVec2OperatorProperty } from './DrawableVec2OperatorProperty';
import { OperatorProperty } from './OperatorProperty';

export class Vec2OperatorProperty extends OperatorProperty<Vec2> {
  constructor(options: OperatorPropertyOptions<Vec2>) {
    super(options);
  }

  override createDrawableRepresentation(): Drawable {
    return new DrawableVec2OperatorProperty(this);
  }
}

import type { Drawable, Vec2 } from '@osucad/framework';
import type { OperatorPropertyOptions } from './OperatorProperty';
import { DrawableVec2OperatorProperty } from './DrawableVec2OperatorProperty';
import { OperatorProperty } from './OperatorProperty';

export interface Vec2OperatorPropertyOptions extends OperatorPropertyOptions<Vec2> {
  precision?: number;
}

export class Vec2OperatorProperty extends OperatorProperty<Vec2> {
  constructor(options: Vec2OperatorPropertyOptions) {
    super(options);

    this.precision = options.precision;
  }

  readonly precision?: number;

  override createDrawableRepresentation(): Drawable {
    return new DrawableVec2OperatorProperty(this);
  }
}

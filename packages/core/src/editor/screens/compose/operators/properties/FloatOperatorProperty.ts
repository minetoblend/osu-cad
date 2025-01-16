import type { Drawable } from '@osucad/framework';
import type { OperatorPropertyOptions } from './OperatorProperty';
import { DrawableFloatOperatorProperty } from './DrawableFloatOperatorProperty';
import { OperatorProperty } from './OperatorProperty';

export interface FloatOperatorPropertyOptions extends OperatorPropertyOptions<number> {
  precision?: number;
}

export class FloatOperatorProperty extends OperatorProperty<number> {
  constructor(options: FloatOperatorPropertyOptions) {
    super(options);

    this.precision = options.precision;
  }

  readonly precision?: number;

  override createDrawableRepresentation(): Drawable {
    return new DrawableFloatOperatorProperty(this);
  }
}

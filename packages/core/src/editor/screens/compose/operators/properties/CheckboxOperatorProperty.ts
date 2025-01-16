import type { Drawable } from '@osucad/framework';
import type { OperatorPropertyOptions } from './OperatorProperty';
import { DrawableCheckboxOperatorProperty } from './DrawableCheckboxOperatorProperty';
import { OperatorProperty } from './OperatorProperty';

export class CheckboxOperatorProperty extends OperatorProperty<boolean> {
  constructor(options: OperatorPropertyOptions<boolean>) {
    super(options);
  }

  override createDrawableRepresentation(): Drawable {
    return new DrawableCheckboxOperatorProperty(this);
  }
}

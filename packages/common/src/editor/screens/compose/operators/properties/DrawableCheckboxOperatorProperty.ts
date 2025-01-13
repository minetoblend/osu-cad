import type { Drawable } from 'osucad-framework';
import type { OperatorProperty } from './OperatorProperty';
import { Checkbox } from '../../../../../userInterface/Checkbox';
import { DrawableOperatorProperty } from './DrawableOperatorProperty';

export class DrawableCheckboxOperatorProperty extends DrawableOperatorProperty<boolean> {
  constructor(property: OperatorProperty<boolean>) {
    super(property);
  }

  protected override createComponents(): Drawable[] {
    return [new Checkbox({
      current: this.propertyValue,
    })];
  }
}

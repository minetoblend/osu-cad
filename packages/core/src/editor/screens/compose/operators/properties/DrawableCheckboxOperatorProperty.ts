import type { Drawable } from '@osucad/framework';
import type { OperatorProperty } from './OperatorProperty';
import { resolved } from '@osucad/framework';
import { Checkbox } from '../../../../../userInterface/Checkbox';
import { OperatorBox } from '../OperatorBox';
import { DrawableOperatorProperty } from './DrawableOperatorProperty';

export class DrawableCheckboxOperatorProperty extends DrawableOperatorProperty<boolean> {
  constructor(property: OperatorProperty<boolean>) {
    super(property);
  }

  @resolved(OperatorBox)
  operatorBox!: OperatorBox;

  protected override createComponents(): Drawable[] {
    return [
      new Checkbox({
        current: this.propertyValue,
      }).adjust(it => it.tabbableContentContainer = this.operatorBox),
    ];
  }
}

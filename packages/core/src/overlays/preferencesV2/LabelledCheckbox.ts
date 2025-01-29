import { Checkbox } from '../../userInterface/Checkbox';
import { LabelledDrawable } from './LabelledDrawable';

export class LabelledCheckbox extends LabelledDrawable<Checkbox> {
  constructor(label: string) {
    super({ label });
  }

  protected override createComponent(): Checkbox {
    return new Checkbox();
  }
}

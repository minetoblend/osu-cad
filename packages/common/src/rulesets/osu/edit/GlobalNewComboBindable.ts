import { Bindable } from 'osucad-framework';
import { TernaryState } from '../../../utils/TernaryState';

export class GlobalNewComboBindable extends Bindable<TernaryState> {
  constructor() {
    super(TernaryState.Inactive);
  }

  toggle() {
    if (this.value === TernaryState.Active)
      this.value = TernaryState.Inactive;
    else
      this.value = TernaryState.Active;
  }

  override createInstance(): Bindable<TernaryState> {
    return new GlobalNewComboBindable();
  }
}

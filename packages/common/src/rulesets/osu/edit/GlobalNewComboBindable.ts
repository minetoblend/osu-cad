import { Bindable } from 'osucad-framework';
import { TernaryState } from '../../../utils/TernaryState';

export class GlobalNewComboBindable extends Bindable<TernaryState> {
  constructor() {
    super(TernaryState.Inactive);
  }
}

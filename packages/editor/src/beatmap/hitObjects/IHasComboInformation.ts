import type { Bindable } from 'osucad-framework';

export interface IHasComboInformation {
  readonly hasComboInformation: true;

  readonly indexInComboBindable: Bindable<number>;

  indexInCombo: number;

  readonly comboIndexBindable: Bindable<number>;

  comboIndex: number;

  newCombo: boolean;
}

export function hasComboInformation(obj: any): obj is IHasComboInformation {
  return obj.hasComboInformation === true;
}

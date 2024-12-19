import type { Bindable } from 'osucad-framework';
import type { Color } from 'pixi.js';

export interface IHasComboInformation {
  readonly hasComboInformation: true;

  readonly indexInComboBindable: Bindable<number>;

  indexInCombo: number;

  readonly comboIndexBindable: Bindable<number>;

  comboIndex: number;

  comboOffset: number;

  newCombo: boolean;

  comboColor: Color;
}

export function hasComboInformation(obj: any): obj is IHasComboInformation {
  return obj.hasComboInformation === true;
}

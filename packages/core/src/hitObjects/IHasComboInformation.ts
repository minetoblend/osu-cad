import type { Bindable } from '@osucad/framework';
import type { ISkin } from '../skinning';
import { Color } from 'pixi.js';
import { SkinComboColorLookup } from '../skinning/SkinComboColorLookup';

export interface IHasComboInformation {
  readonly hasComboInformation: true;

  readonly indexInComboBindable: Bindable<number>;

  indexInCombo: number;

  readonly comboIndexBindable: Bindable<number>;

  comboIndex: number;

  comboOffset: number;

  newCombo: boolean;

  comboColor: Color;

  getComboColor(skin: ISkin): Color;
}

export function hasComboInformation(obj: any): obj is IHasComboInformation {
  return obj?.hasComboInformation === true;
}

const white = new Color(0xFFFFFF);

export function getSkinComboColor(obj: IHasComboInformation, skin: ISkin) {
  return skin.getConfig(new SkinComboColorLookup(obj.comboIndex, obj)) ?? white;
}

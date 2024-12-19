import type { IHasComboInformation } from '@osucad/common';
import type { Color } from 'pixi.js';
import { SkinConfigurationLookup } from './SkinConfigurationLookup';

export class SkinComboColorLookup extends SkinConfigurationLookup<Color> {
  constructor(readonly colorIndex: number, readonly combo: IHasComboInformation) {
    super();
  }
}

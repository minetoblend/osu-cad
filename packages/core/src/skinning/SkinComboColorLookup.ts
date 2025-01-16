import type { Color } from 'pixi.js';
import type { IHasComboInformation } from '../hitObjects/IHasComboInformation';
import { SkinConfigurationLookup } from './SkinConfigurationLookup';

export class SkinComboColorLookup extends SkinConfigurationLookup<Color> {
  constructor(readonly colorIndex: number, readonly combo: IHasComboInformation) {
    super();
  }
}

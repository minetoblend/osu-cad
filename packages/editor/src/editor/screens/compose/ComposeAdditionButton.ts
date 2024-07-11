import { Texture } from 'pixi.js';
import { ComposeToolbarButton } from './ComposeToolbarButton';
import { SampleType } from '@osucad/common';

export class ComposeAdditionButton extends ComposeToolbarButton {
  constructor(
    icon: Texture,
    readonly sampleType: SampleType,
  ) {
    super(icon);
  }
}

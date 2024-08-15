import type { Additions, Slider, SliderPathPreset } from '@osucad/common';
import type { Bindable } from 'osucad-framework';

import { DrawableHitObjectPlacementTool } from './DrawableHitObjectPlacementTool';

export class DrawableSliderPresetTool extends DrawableHitObjectPlacementTool<Slider> {
  constructor(readonly preset: SliderPathPreset) {
    super();
  }

  createObject(): Slider {
    throw new Error('Method not implemented.');
  }

  applySampleType(addition: Additions, bindable: Bindable<boolean>): void {
    throw new Error('Method not implemented.');
  }
}

import type { DrawableComposeTool, IComposeTool } from '@osucad/core';
import { getIcon } from '@osucad/resources';
import { DrawableSliderPlacementTool } from './DrawableSliderPlacementTool';

export class SliderPlacementTool implements IComposeTool {
  readonly title = 'Slider';

  readonly icon = getIcon('slider');

  createDrawableTool(): DrawableComposeTool {
    return new DrawableSliderPlacementTool();
  }
}

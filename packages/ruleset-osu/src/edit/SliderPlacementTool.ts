import type { IComposeTool } from '@osucad/common';
import type { DrawableComposeTool } from 'packages/common/src/editor/screens/compose/DrawableComposeTool';
import { getIcon } from '@osucad/resources';
import { DrawableSliderPlacementTool } from './DrawableSliderPlacementTool';

export class SliderPlacementTool implements IComposeTool {
  readonly title = 'Slider';

  readonly icon = getIcon('slider');

  createDrawableTool(): DrawableComposeTool {
    return new DrawableSliderPlacementTool();
  }
}

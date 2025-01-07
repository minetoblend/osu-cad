import type { DrawableComposeTool } from 'packages/common/src/editor/screens/compose/DrawableComposeTool';
import type { IComposeTool } from '../../../editor/screens/compose/IComposeTool';
import { getIcon } from '@osucad/resources';
import { isMobile } from 'osucad-framework';
import { DrawableSliderPlacementTool } from './DrawableSliderPlacementTool';
import { MobileDrawableSliderPlacementTool } from './MobileDrawableSliderPlacementTool';

export class SliderPlacementTool implements IComposeTool {
  readonly title = 'Slider';

  readonly icon = getIcon('slider');

  createDrawableTool(): DrawableComposeTool {
    return isMobile.any ? new MobileDrawableSliderPlacementTool() : new DrawableSliderPlacementTool();
  }
}

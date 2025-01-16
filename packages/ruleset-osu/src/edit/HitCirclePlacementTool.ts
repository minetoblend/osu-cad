import type { DrawableComposeTool, IComposeTool } from '@osucad/core';

import { getIcon } from '@osucad/resources';
import { DrawableHitCirclePlacementTool } from './DrawableHitCirclePlacementTool';

export class HitCirclePlacementTool implements IComposeTool {
  readonly title = 'Hitcircle';

  readonly icon = getIcon('circle');

  createDrawableTool(): DrawableComposeTool {
    return new DrawableHitCirclePlacementTool();
  }
}

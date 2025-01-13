import type { IComposeTool } from '@osucad/common';

import type { DrawableComposeTool } from 'packages/common/src/editor/screens/compose/DrawableComposeTool';
import { getIcon } from '@osucad/resources';
import { DrawableHitCirclePlacementTool } from './DrawableHitCirclePlacementTool';

export class HitCirclePlacementTool implements IComposeTool {
  readonly title = 'Hitcircle';

  readonly icon = getIcon('circle');

  createDrawableTool(): DrawableComposeTool {
    return new DrawableHitCirclePlacementTool();
  }
}

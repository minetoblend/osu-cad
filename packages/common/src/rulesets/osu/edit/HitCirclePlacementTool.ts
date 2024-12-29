import type { DrawableComposeTool } from 'packages/common/src/editor/screens/compose/DrawableComposeTool';
import type { IComposeTool } from '../../../editor/screens/compose/IComposeTool';
import { getIcon } from '../../../OsucadIcons';
import { DrawableHitCirclePlacementTool } from './DrawableHitCirclePlacementTool';

export class HitCirclePlacementTool implements IComposeTool {
  readonly title = 'Hitcircle';

  readonly icon = getIcon('circle');

  createDrawableTool(): DrawableComposeTool {
    return new DrawableHitCirclePlacementTool();
  }
}

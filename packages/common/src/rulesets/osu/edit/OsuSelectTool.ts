import type { DrawableComposeTool } from 'packages/common/src/editor/screens/compose/DrawableComposeTool';
import type { IComposeTool } from '../../../editor/screens/compose/IComposeTool';
import { getIcon } from '@osucad/resources';
import { DrawableOsuSelectTool } from './DrawableOsuSelectTool';

export class OsuSelectTool implements IComposeTool {
  readonly title = 'Select';
  readonly icon = getIcon('select');

  createDrawableTool(): DrawableComposeTool {
    return new DrawableOsuSelectTool();
  }

  children?: IComposeTool[] | undefined;
}

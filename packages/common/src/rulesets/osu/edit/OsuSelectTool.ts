import type { DrawableComposeTool } from 'packages/common/src/editor/screens/compose/DrawableComposeTool';
import type { IComposeTool } from '../../../editor/screens/compose/IComposeTool';
import { getIcon } from '../../../OsucadIcons';
import { DrawableOsuSelectTool } from './DrawableOsuSelectTool';

export class OsuSelectTool implements IComposeTool {
  readonly title = 'Select';
  readonly icon = getIcon('select@2x');

  createDrawableTool(): DrawableComposeTool {
    return new DrawableOsuSelectTool();
  }

  children?: IComposeTool[] | undefined;
}

import type { DrawableComposeTool } from '../../compose/DrawableComposeTool';
import type { IComposeTool } from '../../compose/IComposeTool';
import { getIcon } from '../../../../OsucadIcons';
import { DrawableModdingSelectTool } from './DrawableModdingSelectTool';

export class ModdingSelectTool implements IComposeTool {
  readonly title = 'Select';
  readonly icon = getIcon('select@2x');
  createDrawableTool(): DrawableComposeTool {
    return new DrawableModdingSelectTool();
  }
}

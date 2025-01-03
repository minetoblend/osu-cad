import type { DrawableComposeTool } from '../../compose/DrawableComposeTool';
import type { IComposeTool } from '../../compose/IComposeTool';
import { getIcon } from '../../../../OsucadIcons';
import { DrawableModdingSelectTool } from './DrawableModdingSelectTool';

export class PenTool implements IComposeTool {
  readonly title = 'Annotate';
  readonly icon = getIcon('pen');
  createDrawableTool(): DrawableComposeTool {
    return new DrawableModdingSelectTool();
  }
}

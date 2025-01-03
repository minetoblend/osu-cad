import type { DrawableComposeTool } from '../../compose/DrawableComposeTool';
import type { IComposeTool } from '../../compose/IComposeTool';
import { getIcon } from '../../../../OsucadIcons';
import { DrawablePenTool } from './DrawablePenTool';

export class PenTool implements IComposeTool {
  readonly title = 'Annotate';
  readonly icon = getIcon('pen');
  createDrawableTool(): DrawableComposeTool {
    return new DrawablePenTool();
  }
}

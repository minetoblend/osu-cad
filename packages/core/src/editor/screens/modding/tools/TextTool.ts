import type { DrawableComposeTool } from '../../compose/DrawableComposeTool';
import type { IComposeTool } from '../../compose/IComposeTool';
import { getIcon } from '@osucad/resources';
import { DrawableTextTool } from './DrawableTextTool';

export class TextTool implements IComposeTool {
  readonly title = 'Note';
  readonly icon = getIcon('tool-text');
  createDrawableTool(): DrawableComposeTool {
    return new DrawableTextTool();
  }
}

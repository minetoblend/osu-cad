import type { DrawableComposeTool } from '../../compose/DrawableComposeTool';
import type { IComposeTool } from '../../compose/IComposeTool';
import { getIcon } from '@osucad/resources';
import { DrawableLineTool } from './DrawableLineTool';

export class LineTool implements IComposeTool {
  readonly title = 'Line';
  readonly icon = getIcon('tool-line');

  createDrawableTool(): DrawableComposeTool {
    return new DrawableLineTool();
  }
}

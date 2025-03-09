import type { DrawableComposeTool, IComposeTool } from '@osucad/core';
import { getIcon } from '@osucad/resources';
import { DrawableOsuSelectTool } from './DrawableOsuSelectTool';

export class OsuSelectTool implements IComposeTool {
  readonly title = 'Select';
  readonly icon = getIcon('select-mc');

  createDrawableTool(): DrawableComposeTool {
    return new DrawableOsuSelectTool();
  }

  children?: IComposeTool[] | undefined;
}

import type { DrawableComposeTool, IComposeTool } from '@osucad/core';
import { getIcon } from '@osucad/resources';
import { DrawableManiaSelectTool } from './DrawableManiaSelectTool';

export class ManiaSelectTool implements IComposeTool {
  readonly title = 'Select';
  readonly icon = getIcon('select');
  createDrawableTool(): DrawableComposeTool {
    return new DrawableManiaSelectTool();
  }
}

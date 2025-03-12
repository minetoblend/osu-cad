import type { DrawableComposeTool, IComposeTool } from '@osucad/core';
import { getIcon } from '@osucad/resources';
import { DrawablePlaceSelectTool } from './DrawablePlaceSelectTool';

export class PlaceSelectTool implements IComposeTool {
  readonly title = 'Select';
  readonly icon = getIcon('select');

  createDrawableTool(): DrawableComposeTool {
    return new DrawablePlaceSelectTool();
  }

  children?: IComposeTool[] | undefined;
}

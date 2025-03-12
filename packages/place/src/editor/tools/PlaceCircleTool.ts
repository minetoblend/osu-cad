import type { DrawableComposeTool, IComposeTool } from '@osucad/core';
import { getIcon } from '@osucad/resources';
import { DrawablePlaceCircleTool } from './DrawablePlaceCircleTool';

export class PlaceCircleTool implements IComposeTool {
  readonly title = 'Hit Circle';
  readonly icon = getIcon('circle');
  createDrawableTool(): DrawableComposeTool {
    return new DrawablePlaceCircleTool();
  }
}

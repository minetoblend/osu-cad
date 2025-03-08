import type { DrawableOptions } from '../drawables/Drawable';
import { CompositeDrawable } from '../containers/CompositeDrawable';
import { Axes } from '../drawables/Axes';
import { Box } from './Box';

export interface FastRoundedBoxOptions extends DrawableOptions {
  cornerRadius?: number;
}

export class FastRoundedBox extends CompositeDrawable {
  constructor(options: FastRoundedBoxOptions = {}) {
    super();

    this.masking = true;

    this.internalChild = new Box({
      relativeSizeAxes: Axes.Both,
    });

    this.with(options);
  }
}

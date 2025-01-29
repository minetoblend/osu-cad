import type { CompositeDrawableOptions } from '@osucad/framework';
import { Axes, CompositeDrawable, FastRoundedBox } from '@osucad/framework';

export class UserAvatar extends CompositeDrawable {
  constructor(options: CompositeDrawableOptions = {}) {
    super();

    this.with(options);

    this.internalChildren = [
      new FastRoundedBox({
        relativeSizeAxes: Axes.Both,
        alpha: 0.2,
        cornerRadius: 4,
      }),
    ];
  }
}

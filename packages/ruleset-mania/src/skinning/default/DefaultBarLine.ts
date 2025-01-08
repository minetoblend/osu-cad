import { Axes, Box, CompositeDrawable } from 'osucad-framework';

export class DefaultBarLine extends CompositeDrawable {
  constructor() {
    super();

    this.relativeSizeAxes = Axes.Both;
    this.internalChild = new Box({
      relativeSizeAxes: Axes.Both,
    });
  }
}

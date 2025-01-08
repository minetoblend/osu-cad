import { Axes, Box, CompositeDrawable } from 'osucad-framework';

export class DefaultColumnBackground extends CompositeDrawable {
  constructor() {
    super();

    this.relativeSizeAxes = Axes.Both;

    this.addInternal(new Box({
      relativeSizeAxes: Axes.Both,
      alpha: 0.25,
    }));
  }
}

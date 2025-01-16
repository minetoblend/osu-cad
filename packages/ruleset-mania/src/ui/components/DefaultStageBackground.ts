import { Axes, Box, CompositeDrawable } from '@osucad/framework';

export class DefaultStageBackground extends CompositeDrawable {
  constructor() {
    super();

    this.relativeSizeAxes = Axes.Both;
    this.internalChild = new Box({
      relativeSizeAxes: Axes.Both,
      color: 'black',
    });
  }
}

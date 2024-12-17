import { Axes, Box, CompositeDrawable } from 'osucad-framework';

export class EditorViewport extends CompositeDrawable {
  constructor() {
    super();
    this.relativeSizeAxes = Axes.Both;
    this.internalChild = new Box({
      relativeSizeAxes: Axes.Both,
    });
  }
}

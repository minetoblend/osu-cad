import type { DrawableOptions } from '@osucad/framework';
import { Anchor, Axes, CompositeDrawable, dependencyLoader, FastRoundedBox } from '@osucad/framework';

export class DiamondShape extends CompositeDrawable {
  constructor(options: DrawableOptions = {}) {
    super();

    this.with(options);
  }

  outline!: FastRoundedBox;

  body!: FastRoundedBox;

  @dependencyLoader()
  [Symbol('load')]() {
    this.addAllInternal(
      this.outline = new FastRoundedBox({
        relativeSizeAxes: Axes.Both,
        cornerRadius: 2,
        anchor: Anchor.Center,
        origin: Anchor.Center,
        rotation: Math.PI / 4,
        alpha: 0.5,
      }),
      this.body = new FastRoundedBox({
        relativeSizeAxes: Axes.Both,
        scale: 0.75,
        cornerRadius: 2,
        anchor: Anchor.Center,
        origin: Anchor.Center,
        rotation: Math.PI / 4,
      }),
    );
  }
}

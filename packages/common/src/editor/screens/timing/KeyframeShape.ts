import { Anchor, Axes, CompositeDrawable, Container, dependencyLoader, FastRoundedBox } from 'osucad-framework';

export class KeyframeShape extends CompositeDrawable {
  protected scaleContainer!: Container;

  protected outline!: FastRoundedBox;

  protected body!: FastRoundedBox;

  @dependencyLoader()
  [Symbol('load')]() {
    this.addInternal(
      this.scaleContainer = new Container({
        relativeSizeAxes: Axes.Both,
        anchor: Anchor.Center,
        origin: Anchor.Center,
        children: [
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
        ],
      }),
    );
  }
}

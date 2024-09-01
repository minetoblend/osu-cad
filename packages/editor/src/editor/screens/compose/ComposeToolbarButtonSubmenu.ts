import { Anchor, Axes, Container, EasingFunction, VisibilityContainer } from 'osucad-framework';
import type { ComposeToolbarButton } from './ComposeToolbarButton';

export class ComposeToolbarButtonSubmenu extends VisibilityContainer {
  constructor(children: ComposeToolbarButton[]) {
    super({
      relativePositionAxes: Axes.X,
      x: 0.5,
      padding: { left: 4 },
      anchor: Anchor.CenterLeft,
      origin: Anchor.CenterLeft,
    });

    this.addInternal(this.#content);

    this.addAll(...children);

    children.forEach((it) => {
      it.alpha = 0;
      it.padding = 2;
      it.scale = 0.5;
      it.anchor = Anchor.CenterLeft;
      it.origin = Anchor.CenterLeft;
    });
  }

  #content = new Container<ComposeToolbarButton>();

  get content() {
    return this.#content;
  }

  popIn() {
    const gap = 0;

    let curX = 0;

    this.moveToX(1, 300, EasingFunction.OutExpo);

    for (let i = 0; i < this.#content.children.length; i++) {
      const child = this.#content.children[i];

      const duration = 250 + i * 50;

      child.fadeIn(duration, EasingFunction.OutExpo);
      child.moveToX(curX, duration, EasingFunction.OutExpo);
      child.scaleTo(1, duration, EasingFunction.OutExpo);

      curX += child.drawSize.x + gap;
    }
  }

  popOut() {
    this.moveToX(0.5, 300, EasingFunction.OutExpo);

    for (const child of this.children) {
      child.fadeOut(300, EasingFunction.OutExpo);
      child.moveToX(0, 300, EasingFunction.OutExpo);
      child.scaleTo(0.75, 300, EasingFunction.OutExpo);
    }
  }
}

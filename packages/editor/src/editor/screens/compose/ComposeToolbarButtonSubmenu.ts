import { Anchor, Axes, Container, VisibilityContainer } from 'osucad-framework';
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

    this.moveTo({ x: 1, duration: 300, easing: 'expo.out' });

    for (let i = 0; i < this.#content.children.length; i++) {
      const child = this.#content.children[i];

      const duration = 250 + i * 50;

      child.fadeIn({ duration, easing: 'expo.out' });
      child.moveTo({ x: curX, duration, easing: 'expo.out' });
      child.scaleTo({ scale: 1, duration, easing: 'expo.out' });

      curX += child.drawSize.x + gap;
    }
  }

  popOut() {
    this.moveTo({ x: 0.5, duration: 300, easing: 'expo.out' });

    for (const child of this.children) {
      child.fadeOut({ duration: 300, easing: 'expo.out' });
      child.moveTo({ x: 0, duration: 300, easing: 'expo.out' });
      child.scaleTo({ scale: 0.75, duration: 300, easing: 'expo.out' });
    }
  }
}

import type { EditorButton } from './EditorButton';
import { Anchor, Axes, Container, EasingFunction, VisibilityContainer } from 'osucad-framework';

export class EditorButtonSubmenu extends VisibilityContainer {
  constructor(buttons: EditorButton[]) {
    super({
      relativePositionAxes: Axes.X,
      x: 0.5,
      padding: { left: 4 },
      autoSizeAxes: Axes.Both,
      anchor: Anchor.CenterLeft,
      origin: Anchor.CenterLeft,
    });

    this.addInternal(this.#content);

    this.addAll(...buttons);

    buttons.forEach((it) => {
      it.anchor = Anchor.CenterLeft;
      it.origin = Anchor.CenterLeft;
    });
  }

  readonly #content = new Container<EditorButton>();

  override get content() {
    return this.#content;
  }

  protected override get startHidden(): boolean {
    return true;
  }

  override popIn() {
    const gap = 4;

    let curX = 0;

    this.moveToX(1, 300, EasingFunction.OutExpo);

    for (let i = 0; i < this.children.length; i++) {
      const child = this.children[i];

      const duration = 180 + i * 50;

      child.fadeIn(duration, EasingFunction.OutExpo);
      child.moveToX(curX, duration, EasingFunction.OutExpo);
      child.scaleTo(1, duration, EasingFunction.OutExpo);

      curX += child.drawSize.x + gap;
    }
  }

  override popOut() {
    this.moveToX(0.5, 300, EasingFunction.OutExpo);

    for (const child of this.children) {
      child.fadeOut(300, EasingFunction.OutExpo);
      child.moveToX(0, 300, EasingFunction.OutExpo);
      child.scaleTo(0.75, 300, EasingFunction.OutExpo);
    }
  }
}

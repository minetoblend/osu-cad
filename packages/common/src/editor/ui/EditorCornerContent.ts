import type { Drawable, Vec2 } from 'osucad-framework';
import { Anchor, Axes, Container, EasingFunction } from 'osucad-framework';
import { Corner } from './Corner';

export class EditorCornerContent extends Container {
  constructor(readonly corner: Corner) {
    super();

    this.relativeSizeAxes = Axes.Y;
    this.autoSizeAxes = Axes.X;
    this.masking = true;

    this.internalChild = this.#content = new Container({
      relativeSizeAxes: Axes.Y,
      autoSizeAxes: Axes.X,
    });

    if (corner === Corner.TopRight || corner === Corner.BottomRight)
      this.anchor = this.origin = Anchor.TopRight;
  }

  readonly #content: Container;

  override get content(): Container<Drawable> {
    return this.#content;
  }

  onEntering(previous: EditorCornerContent | null) {
    const direction = (this.corner === Corner.TopLeft || this.corner === Corner.BottomLeft) ? -1 : 1;

    this.fadeInFromZero(300, EasingFunction.OutQuad);

    this.#content.moveToX(direction * 50).moveToX(0, 300, EasingFunction.OutExpo);
  }

  onExiting(next: EditorCornerContent | null) {
    const direction = (this.corner === Corner.TopLeft || this.corner === Corner.BottomLeft) ? 1 : -1;

    this.fadeOut(150, EasingFunction.OutExpo);

    this.#content.moveToX(direction * 50, 300, EasingFunction.OutExpo);

    this.bypassAutoSizeAxes = Axes.Both;
  }

  override get size(): Vec2 {
    return this.#content.size;
  }
}

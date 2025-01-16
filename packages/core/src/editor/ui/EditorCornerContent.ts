import type { Drawable } from '@osucad/framework';
import { Axes, Container, EasingFunction } from '@osucad/framework';
import { Corner } from './Corner';

export class EditorCornerContent extends Container {
  constructor(readonly corner: Corner) {
    super();

    this.relativeSizeAxes = Axes.Y;
    this.masking = true;

    this.internalChild = this.#content = new Container({});
  }

  readonly #content: Container;

  override get content(): Container<Drawable> {
    return this.#content;
  }

  protected override loadComplete() {
    super.loadComplete();

    this.content.autoSizeAxes = this.autoSizeAxes;
    this.content.relativeSizeAxes = this.relativeSizeAxes;
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
    this.#content.bypassAutoSizeAxes = Axes.Both;
  }
}

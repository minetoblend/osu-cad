import type {
  ContainerOptions,
  Drawable,
  IVec2,
} from '@osucad/framework';
import {
  Axes,
  Container,
  Invalidation,
  LayoutComputed,
  Vec2,
} from '@osucad/framework';

export interface SizeLimitedContainerOptions<T extends Drawable> extends ContainerOptions<T> {
  maxWidth?: number;
  maxHeight?: number;
  maxSize?: IVec2;
}

export class SizeLimitedContainer<T extends Drawable = Drawable> extends Container {
  constructor(options: SizeLimitedContainerOptions<T>) {
    super();

    this.addLayout(this.#drawSizeBacking);

    this.with({
      relativeSizeAxes: Axes.Both,
      ...options,
    });
  }

  #maxWidth = 0;

  #maxHeight = 0;

  get maxWidth() {
    return this.#maxWidth;
  }

  set maxWidth(value) {
    if (this.#maxWidth === value)
      return;

    this.#maxWidth = value;

    this.#drawSizeBacking.invalidate();
  }

  get maxHeight() {
    return this.#maxHeight;
  }

  set maxHeight(value) {
    if (this.#maxHeight === value)
      return;

    this.#maxHeight = value;

    this.#drawSizeBacking.invalidate();
  }

  get maxSize(): Vec2 {
    return new Vec2(this.maxWidth, this.maxHeight);
  }

  set maxSize(value: IVec2) {
    if (this.maxWidth === value.x && this.maxHeight === value.y)
      return;

    this.#maxWidth = value.x;
    this.#maxHeight = value.y;

    this.#drawSizeBacking.invalidate();
  }

  #drawSizeBacking = new LayoutComputed(() => {
    const drawSize = super.drawSize.clone();

    if (this.maxWidth > 0)
      drawSize.x = Math.min(drawSize.x, this.maxWidth);
    if (this.maxHeight > 0)
      drawSize.y = Math.min(drawSize.y, this.maxHeight);

    return drawSize;
  }, Invalidation.DrawSize);

  override get drawSize() {
    return this.#drawSizeBacking.value;
  }
}

import { Vec2 } from '@osucad/common';
import { Axes } from './Axes';
import { ContainerDrawable } from './ContainerDrawable';
import { Fit } from './Fit';
import { Invalidation } from './Invalidation';

export interface DrawsizePreservingContainerOptions {
  width: number;
  height: number;
  fit?: Fit;
}

export class DrawsizePreservingContainer extends ContainerDrawable {
  #desiredSize: Vec2;
  #fit: Fit;

  get desiredSize() {
    return this.#desiredSize;
  }

  set desiredSize(value: Vec2) {
    this.#desiredSize.copyFrom(value);
    this.invalidate(Invalidation.DrawSize);
  }

  private container = new ContainerDrawable();

  override get content() {
    return this.container;
  }

  constructor(options: DrawsizePreservingContainerOptions) {
    super();
    this.relativeSizeAxes = Axes.Both;
    this.#desiredSize = new Vec2(options.width, options.height);
    this.#fit = options.fit ?? Fit.Contain;
    this.addInternal(this.container);
  }

  override handleInvalidations(): void {
    super.handleInvalidations();

    if (this._invalidations & Invalidation.DrawSize && this.parent) {
      let scale: Vec2;

      switch (this.#fit) {
        case Fit.Contain:
        case Fit.Fill:
          scale = new Vec2(
            Math.min(
              this.drawSize.x / this.#desiredSize.x,
              this.drawSize.y / this.#desiredSize.y,
            ),
          );
          break;
        case Fit.Cover:
          scale = new Vec2(
            Math.max(
              this.drawSize.x / this.#desiredSize.x,
              this.drawSize.y / this.#desiredSize.y,
            ),
          );
          break;
      }

      if (this.#fit === Fit.Fill) {
        this.container.scale = scale;
        const size = this.#desiredSize.clone();
        if (
          this.drawSize.x / this.drawSize.y >
          this.#desiredSize.x / this.#desiredSize.y
        ) {
          size.x = this.drawSize.x * (this.#desiredSize.y / this.drawSize.y);
        } else {
          size.y = this.drawSize.y * (this.#desiredSize.x / this.drawSize.x);
        }

        this.container.size = size;
        this.container.position = new Vec2();
      } else {
        this.container.scale = scale;
        this.container.size = this.#desiredSize;
        this.container.position = new Vec2(
          (this.drawSize.x - this.#desiredSize.x * scale.x) / 2,
          (this.drawSize.y - this.#desiredSize.y * scale.y) / 2,
        );
      }
    }
  }
}

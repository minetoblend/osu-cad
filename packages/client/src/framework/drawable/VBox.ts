import { Vec2 } from '@osucad/common';
import {
  ContainerDrawable,
  ContainerDrawableOptions,
} from './ContainerDrawable';
import { Invalidation } from './Invalidation';

export interface VBoxOptions extends ContainerDrawableOptions {
  gap?: number;
}

export class VBox extends ContainerDrawable {
  constructor(options: VBoxOptions = {}) {
    super(options);
    this.gap = options.gap ?? 0;
  }

  #gap = 0;

  get gap() {
    return this.#gap;
  }

  set gap(value) {
    this.#gap = value;
    this.invalidate(Invalidation.Layout);
  }

  override handleInvalidations(): void {
    super.handleInvalidations();
    if (this._invalidations & Invalidation.Layout) {
      let y = 0;
      for (const child of this.internalChildren) {
        const { y: height } = child.requiredSizeToFit;
        child.position = new Vec2(0, y);
        y += height + this.gap;
      }
    }
  }

  override childrenCanBeOutOfBounds(): boolean {
    return true;
  }
}

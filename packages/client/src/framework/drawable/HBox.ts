import { Vec2 } from '@osucad/common';
import {
  ContainerDrawable,
  ContainerDrawableOptions,
} from './ContainerDrawable';
import { Invalidation } from './Invalidation';

export interface HBoxOptions extends ContainerDrawableOptions {
  gap?: number;
  alignItems?: AlignItems;
}

export type AlignItems = 'start' | 'center' | 'end';

export class HBox extends ContainerDrawable {
  constructor(options: HBoxOptions = {}) {
    super(options);
    this.gap = options.gap ?? 0;
    this.alignItems = options.alignItems ?? 'start';
  }

  #gap = 0;

  get gap() {
    return this.#gap;
  }

  set gap(value) {
    this.#gap = value;
    this.invalidate(Invalidation.Layout);
  }

  #alignItems: AlignItems = 'start';

  get alignItems() {
    return this.#alignItems;
  }

  set alignItems(value) {
    this.#alignItems = value;
    this.invalidate(Invalidation.Layout);
  }

  override handleInvalidations(): void {
    super.handleInvalidations();
    if (this._invalidations & Invalidation.Layout) {
      let x = 0;

      for (const child of this.internalChildren) {
        const { x: width } = child.requiredSizeToFit;
        child.position = new Vec2(x, 0);
        x += width + this.gap;
      }

      // this.height = y - this.gap + this.padding.vertical;
      // this.width = maxWidth + this.padding.horizontal;
    }
  }

  get requiredSizeToFit() {
    let width = 0;
    let height = 0;

    for (const child of this.internalChildren) {
      width = Math.max(width, child.requiredSizeToFit.x);
      height += child.requiredSizeToFit.y + this.gap;
    }

    return new Vec2(
      width + this.padding.horizontal,
      height - this.gap + this.padding.vertical,
    );
  }

  override childrenCanBeOutOfBounds(): boolean {
    return true;
  }
}

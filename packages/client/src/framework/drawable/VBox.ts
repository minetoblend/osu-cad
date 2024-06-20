import { Vec2 } from '@osucad/common';
import {
  ContainerDrawable,
  ContainerDrawableOptions,
} from './ContainerDrawable';
import { Invalidation } from './Invalidation';

export interface VBoxOptions extends ContainerDrawableOptions {
  gap?: number;
  alignItems?: AlignItems;
}

export type AlignItems = 'start' | 'center' | 'end';

export class VBox extends ContainerDrawable {
  constructor(options: VBoxOptions = {}) {
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
      let y = 0;

      const maxWidth = this.children.reduce(
        (max, child) => Math.max(max, child.requiredSizeToFit.x),
        0,
      );

      for (const child of this.internalChildren) {
        const { y: height } = child.requiredSizeToFit;
        child.position = new Vec2(0, y);
        y += height + this.gap;

        if (this.alignItems === 'center') {
          child.position = new Vec2(
            (maxWidth - child.requiredSizeToFit.x) / 2,
            child.position.y,
          );
        }
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

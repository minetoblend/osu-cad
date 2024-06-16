import { Container } from 'pixi.js';
import { DependencyContainer } from '../di/DependencyContainer';
import { Vec2 } from '@osucad/common';
import { Drawable, DrawableOptions } from './Drawable';
import { Invalidation } from './Invalidation';
import { LoadState } from './LoadState';
import { MarginPadding } from './MarginPadding';

export interface CompositeDrawableOptions extends DrawableOptions {
  padding?: number | MarginPadding;
}

export class CompositeDrawable extends Drawable {
  constructor(options: CompositeDrawableOptions = {}) {
    const { padding, ...rest } = options;
    super(rest);

    if (padding !== undefined) {
      if (typeof padding === 'number') {
        this.padding = new MarginPadding(padding);
      } else {
        this.padding = padding;
      }
    }
  }

  readonly drawNode = new Container();

  readonly internalChildren: Drawable[] = [];

  #padding = MarginPadding.default();

  get padding() {
    return this.#padding;
  }

  set padding(value: MarginPadding) {
    this.#padding = value;
    this.#childSize = undefined;
    for (const child of this.internalChildren) {
      child.invalidate(
        child.invalidationFromParentDrawsize | Invalidation.Transform,
      );
    }
  }

  addInternal<T extends Drawable>(child: T): T {
    this.internalChildren.push(child);
    child._parent = this;
    this.drawNode.addChild(child.drawNode);
    if (this.loadState >= LoadState.Loading) {
      child._load(this.dependencies);
    }
    this.invalidate(Invalidation.Layout);
    return child;
  }

  removeInternal(child: Drawable, destroy = true): void {
    const index = this.internalChildren.indexOf(child);
    if (index !== -1) {
      this.internalChildren.splice(index, 1);
      child._parent = undefined;
      this.drawNode.removeChild(child.drawNode);
      child.onRemoved();
      if (destroy) {
        child.destroy();
      }
      this.invalidate(Invalidation.Layout);
    } else {
      throw new Error('Child not found');
    }
  }

  override _load(dependencies: DependencyContainer): void {
    super._load(dependencies);
    for (const child of this.internalChildren) {
      if (child.loadState === LoadState.NotLoaded)
        child._load(this.dependencies);
    }
  }

  override updateSubtree(): void {
    super.updateSubtree();
    for (const child of this.internalChildren) {
      child.updateSubtree();
    }
  }

  #childSize?: Vec2;

  private computeChildSize(): Vec2 {
    return new Vec2(
      this.drawSize.x - this.padding.horizontal,
      this.drawSize.y - this.padding.vertical,
    );
  }

  get childSize(): Vec2 {
    this.#childSize ??= this.computeChildSize();
    return this.#childSize;
  }

  get childOffset() {
    return new Vec2(this.padding.left, this.padding.top);
  }

  override handleInvalidations(): void {
    super.handleInvalidations();
    if (this._invalidations & Invalidation.DrawSize) {
      this.#childSize = undefined;

      for (const child of this.internalChildren) {
        child.invalidate(
          child.invalidationFromParentDrawsize | Invalidation.Transform,
        );
      }
    }
  }

  interactiveChildren = true;

  override canHaveChildren(): this is CompositeDrawable {
    return true;
  }

  childrenCanBeOutOfBounds() {
    return false;
  }

  destroy() {
    super.destroy();
    for (const child of this.internalChildren) {
      child.destroy();
    }
  }
}

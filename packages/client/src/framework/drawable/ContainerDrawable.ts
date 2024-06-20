import {
  CompositeDrawable,
  CompositeDrawableOptions,
} from './CompositeDrawable';
import { Drawable } from './Drawable';
import { Invalidation } from './Invalidation';

export interface ContainerDrawableOptions<T extends Drawable = Drawable>
  extends CompositeDrawableOptions {
  children?: T[];
}

export class ContainerDrawable<
  T extends Drawable = Drawable,
> extends CompositeDrawable<T> {
  constructor(options: ContainerDrawableOptions<T> = {}) {
    const { children, ...rest } = options;
    super(rest);

    if (children) {
      for (const child of children) {
        this.add(child);
      }
    }
  }

  get content(): ContainerDrawable<T> {
    return this;
  }

  get children(): T[] {
    if (this.content === this) {
      return this.internalChildren;
    }
    return this.content.children;
  }

  add<V extends T>(child: V): V {
    if (this.content === this) {
      this.content.addInternal(child);
    } else {
      this.content.add(child);
    }
    this.invalidate(Invalidation.Layout);
    return child;
  }

  addAll(children: T[]) {
    for (const child of children) {
      this.add(child);
    }
  }

  remove(child: T, destroy = true) {
    if (this.content === this) {
      this.content.removeInternal(child, destroy);
    } else {
      this.content.remove(child, destroy);
    }
  }

  removeAll(destroy = true) {
    for (const child of this.children) {
      this.remove(child, destroy);
    }
  }
}

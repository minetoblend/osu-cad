import {
  CompositeDrawable,
  CompositeDrawableOptions,
} from "./CompositeDrawable";
import { Drawable } from "./Drawable";

export interface ContainerDrawableOptions extends CompositeDrawableOptions {
  children?: Drawable[];
}

export class ContainerDrawable extends CompositeDrawable {
  constructor(options: ContainerDrawableOptions = {}) {
    const { children, ...rest } = options;
    super(rest);

    if (children) {
      for (const child of children) {
        this.add(child);
      }
    }
  }

  get content(): ContainerDrawable {
    return this;
  }

  get children(): Drawable[] {
    if (this.content === this) {
      return this.internalChildren;
    }
    return this.content.children;
  }

  add<T extends Drawable>(child: T): T {
    if (this.content === this) {
      this.content.addInternal(child);
    } else {
      this.content.add(child);
    }
    return child;
  }

  addAll(children: Drawable[]) {
    for (const child of children) {
      this.add(child);
    }
  }

  remove(child: Drawable, destroy = true) {
    if (this.content === this) {
      this.content.removeInternal(child, destroy);
    } else {
      this.content.remove(child, destroy);
    }
  }
}

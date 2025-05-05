import type { Drawable } from "../drawables/Drawable";
import { CompositeDrawable, type CompositeDrawableOptions } from "./CompositeDrawable";

export interface ContainerOptions<T extends Drawable = Drawable> extends CompositeDrawableOptions
{
  children?: T[];
  child?: T;
}

export class Container<T extends Drawable = Drawable> extends CompositeDrawable
{
  constructor(options: ContainerOptions<T> = {})
  {
    super();
    this.with(options);
  }

  static create<T extends Drawable = Drawable>(options: ContainerOptions<T> = {}): Container
  {
    return new Container().with(options);
  }

  override with(options: ContainerOptions<T>): this
  {
    const { children, child, ...rest } = options;
    super.with(rest);

    if (child && children)
    {
      throw new Error("Cannot set both child and children");
    }

    if (child)
    {
      this.child = child;
    }

    if (children)
    {
      this.addAll(...children);
    }

    return this;
  }

  get content(): Container<T>
  {
    return this;
  }

  get children(): ReadonlyArray<T>
  {
    if (this.content === this)
    {
      return this.internalChildren as ReadonlyArray<T>;
    }
    return this.content.children;
  }

  set children(value: Iterable<T>)
  {
    this.clear();
    this.addAll(...value);
  }

  add<U extends T>(child: U): U | undefined
  {
    if (this.content === this)
      return this.addInternal(child);
    else
      return this.content.add(child);
  }

  addRange(children: Iterable<T>)
  {
    for (const child of children)
      this.add(child);
  }

  /**
   * @deprecated use `addRange` instead
   * @param children
   */
  addAll(...children: T[]): this
  {
    for (const child of children)
    {
      this.add(child);
    }
    return this;
  }

  remove(child: T, disposeImmediately: boolean = true): boolean
  {
    if (this.content === this)
    {
      return this.removeInternal(child, disposeImmediately);
    }
    else
    {
      return this.content.remove(child, disposeImmediately);
    }
  }

  removeRange(children: T[], disposeImmediately: boolean = true)
  {
    for (const child of children)
      this.remove(child, disposeImmediately);
  }

  clear(disposeImmediately: boolean = true)
  {
    // TODO: Add more efficient clear method
    while (this.children.length > 0)
    {
      this.remove(this.children[0], disposeImmediately);
    }
  }

  get child(): T
  {
    if (this.children.length !== 1)
    {
      throw new Error("Cannot get child when there are multiple children");
    }

    return this.children[0];
  }

  set child(child: T)
  {
    if (this.isDisposed)
      return;

    this.clear();
    this.add(child);
  }

  changeChildDepth(child: T, depth: number)
  {
    if (this.content === this)
    {
      this.changeInternalChildDepth(child, depth);
    }
    else
    {
      this.content.changeChildDepth(child, depth);
    }
  }
}

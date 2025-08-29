import type { Drawable } from "../drawables/Drawable";
import { CompositeDrawable, type CompositeDrawableOptions } from "./CompositeDrawable";

export interface ContainerOptions<T extends Drawable = Drawable> extends CompositeDrawableOptions
{
  children?: T[];
  child?: T;
}

export class Container<T extends Drawable = Drawable> extends CompositeDrawable
{
  public constructor(options: ContainerOptions<T> = {})
  {
    super();
    this.with(options);
  }

  public static create<T extends Drawable = Drawable>(options: ContainerOptions<T> = {}): Container
  {
    return new Container().with(options);
  }

  public override with(options: ContainerOptions<T>): this
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
      this.addRange(children);
    }

    return this;
  }

  public withChild(child: T): this
  {
    this.child = child;
    return this;
  }

  protected get content(): Container<T>
  {
    return this;
  }

  public get children(): ReadonlyArray<T>
  {
    if (this.content === this)
    {
      return this.internalChildren as ReadonlyArray<T>;
    }
    return this.content.children;
  }

  public set children(value: Iterable<T>)
  {
    this.clear();
    this.addAll(...value);
  }

  public add<U extends T>(child: U): U | undefined
  {
    if (this.content === this)
      return this.addInternal(child);
    else
      return this.content.add(child);
  }

  public addRange(children: Iterable<T>)
  {
    for (const child of children)
      this.add(child);
  }

  /**
   * @deprecated use `addRange` instead
   * @param children
   */
  public addAll(...children: T[]): this
  {
    for (const child of children)
    {
      this.add(child);
    }
    return this;
  }

  public remove(child: T, disposeImmediately: boolean = true): boolean
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

  public removeRange(children: T[], disposeImmediately: boolean = true)
  {
    for (const child of children)
      this.remove(child, disposeImmediately);
  }

  public clear(disposeImmediately: boolean = true)
  {
    // TODO: Add more efficient clear method
    while (this.children.length > 0)
    {
      this.remove(this.children[0], disposeImmediately);
    }
  }

  public get child(): T
  {
    if (this.children.length !== 1)
    {
      throw new Error(`Cannot get child when there are ${this.children.length === 0 ? "no" : "multiple"} children`);
    }

    return this.children[0];
  }

  public set child(child: T)
  {
    if (this.isDisposed)
      return;

    this.clear();
    this.add(child);
  }

  public changeChildDepth(child: T, depth: number)
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

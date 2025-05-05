import type { Drawable } from "../drawables";
import { Action } from "../../bindables";
import { type IVec2, Vec2 } from "../../math";
import { Invalidation, InvalidationSource, LayoutMember } from "../drawables";
import { Container } from "./Container";

export abstract class FlowContainer<T extends Drawable = Drawable> extends Container<T>
{
  readonly onLayout = new Action();

  protected constructor()
  {
    super();

    this.addLayout(this.#layout);
    this.addLayout(this.#childLayout);
  }

  get layoutEasing(): this["autoSizeEasing"]
  {
    return this.autoSizeEasing;
  }

  set layoutEasing(easing: this["autoSizeEasing"])
  {
    this.autoSizeEasing = easing;
  }

  get layoutDuration(): number
  {
    return this.autoSizeDuration * 2;
  }

  set layoutDuration(duration: number)
  {
    this.autoSizeDuration = duration / 2;
  }

  #maximumSize = new Vec2();

  get maximumSize(): Vec2
  {
    return this.#maximumSize;
  }

  set maximumSize(size: IVec2)
  {
    if (this.#maximumSize.equals(size))
      return;

    this.#maximumSize = Vec2.from(size);
    this.invalidate(Invalidation.Layout);
  }

  #layout = new LayoutMember(Invalidation.DrawSize);

  #childLayout = new LayoutMember(
      Invalidation.RequiredParentSizeToFit | Invalidation.Presence,
      InvalidationSource.Child,
  );

  override get requiresChildrenUpdate(): boolean
  {
    return super.requiresChildrenUpdate || !this.#layout.isValid;
  }

  protected invalidateLayout(): void
  {
    this.#layout.invalidate();
  }

  readonly #layoutChildren = new Map<T, number>();

  protected override addInternal<U extends Drawable>(drawable: U & T): U | undefined
  {
    this.#layoutChildren.set(drawable, 0);

    this.invalidateLayout();
    return super.addInternal(drawable);
  }

  protected override removeInternal(drawable: T, disposeImmediately?: boolean): boolean
  {
    this.#layoutChildren.delete(drawable);

    this.invalidateLayout();
    return super.removeInternal(drawable, disposeImmediately);
  }

  setLayoutPosition(drawable: T, newPosition: number): void
  {
    if (!this.#layoutChildren.has(drawable))
    {
      throw new Error(
          `Cannot change layout position of drawable which is not contained within this ${this.constructor.name}.`,
      );
    }

    this.#layoutChildren.set(drawable, newPosition);
    this.invalidateLayout();
  }

  insert(position: number, drawable: T): void
  {
    this.add(drawable);
    this.setLayoutPosition(drawable, position);
  }

  getLayoutPosition(drawable: T): number
  {
    if (!this.#layoutChildren.has(drawable))
    {
      throw new Error(
          `Cannot get layout position of drawable which is not contained within this ${this.constructor.name}.`,
      );
    }

    return this.#layoutChildren.get(drawable)!;
  }

  override updateChildrenLife(): boolean
  {
    const changed = super.updateChildrenLife();

    if (changed)
    {
      this.invalidateLayout();
    }

    return changed;
  }

  get flowingChildren()
  {
    return (this.aliveInternalChildren as ReadonlyArray<T>)
      .filter(d => d.isPresent)
      .sort((a, b) =>
      {
        const aPosition = this.#layoutChildren.get(a)!;
        const bPosition = this.#layoutChildren.get(b)!;

        return aPosition - bPosition || this.compare(a, b);
      });
  }

  abstract computeLayoutPositions(): Vec2[];

  #performLayout(): void
  {
    this.onLayout.emit();

    if (this.children.length === 0)
      return;

    const positions = this.computeLayoutPositions();
    const drawables = this.flowingChildren;

    for (let i = 0; i < drawables.length; i++)
    {
      const drawable = drawables[i];
      const pos = positions[i];

      if (this.layoutDuration > 0)
      {
        drawable.moveTo(pos, this.layoutDuration, this.layoutEasing);
      }
      else
      {
        drawable.clearTransforms(false, "position");
        drawable.position = pos;
      }
    }
  }

  override updateAfterChildren(): void
  {
    super.updateAfterChildren();

    if (!this.#childLayout.isValid)
      this.invalidateLayout();

    if (!this.#layout.isValid)
    {
      this.#performLayout();

      this.#layout.validate();
      this.#childLayout.validate();
    }
  }
}

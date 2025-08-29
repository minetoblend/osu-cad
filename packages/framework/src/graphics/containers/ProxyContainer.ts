import type { ReadonlyDependencyContainer } from "../../di/DependencyContainer";
import type { Drawable } from "../drawables/Drawable";
import type { MarginPadding, MarginPaddingOptions } from "../drawables/MarginPadding";
import type { CompositeDrawable } from "./CompositeDrawable";
import { Matrix } from "pixi.js";
import { DependencyContainer } from "../../di/DependencyContainer";
import { Invalidation } from "../drawables/Drawable";
import { Container } from "./Container";

export class ProxyContainer extends Container
{
  public constructor(public readonly source: CompositeDrawable)
  {
    super();
  }

  public override get shouldBeAlive()
  {
    return !this.source.isDisposed && super.shouldBeAlive;
  }

  protected override loadComplete()
  {
    super.loadComplete();

    this.source.invalidated.addListener(this.#onSourceInvalidated, this);
  }

  #onSourceInvalidated(_: Drawable, invalidation: Invalidation)
  {
    invalidation &= Invalidation.DrawSize;

    if (invalidation !== Invalidation.None)
    {
      this.invalidate(invalidation);
    }
  }

  public override get padding(): MarginPadding
  {
    return this.source.padding;
  }

  public override set padding(value: MarginPaddingOptions | undefined)
  {
    throw new Error("May not change padding on a ProxyContainer");
  }

  public override get drawSize()
  {
    return this.source.drawSize;
  }

  public override get childSize()
  {
    return this.source.childSize;
  }

  public override get relativeChildSize()
  {
    return this.source.relativeChildSize;
  }

  public override get relativeToAbsoluteFactor()
  {
    return this.source.relativeToAbsoluteFactor;
  }

  public override get childOffset()
  {
    return this.source.childOffset;
  }

  protected override createChildDependencies(parentDependencies: ReadonlyDependencyContainer): DependencyContainer
  {
    return new DependencyContainer(this.source.dependencies);
  }

  #matrix = new Matrix();

  protected override update()
  {
    super.update();

    this.invalidate(Invalidation.Transform);
  }

  public override updateSubTreeTransforms(): boolean
  {
    this.updateDrawNodeTransform();

    for (const child of this.aliveInternalChildren)
    {
      child.updateSubTreeTransforms();
    }
    return true;
  }

  protected override updateDrawNodeTransform()
  {
    if (this.source.isDisposed)
      return;

    const transform = this.#matrix.copyFrom(this.parent!.drawNode.worldTransform).invert();
    transform.append(this.source.drawNode.worldTransform);

    transform.decompose(this.drawNode);
  }
}

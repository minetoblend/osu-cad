import type { Container as PIXIContainer } from "pixi.js";
import { RenderLayer } from "pixi.js";
import type { ReadonlyDependencyContainer } from "../../di/DependencyContainer";
import { Drawable } from "../drawables/Drawable";

export class ProxyDrawable extends Drawable
{
  public constructor(public readonly source: Drawable)
  {
    super();
  }

  public override get isPresent(): boolean
  {
    return false;
  }

  public override get shouldBeAlive(): boolean
  {
    return this.source.shouldBeAlive;
  }

  public override get removeWhenNotAlive(): boolean
  {
    return this.source.removeWhenNotAlive;
  }

  public override get lifetimeStart(): number
  {
    return this.source.lifetimeStart;
  }

  public override get lifetimeEnd(): number
  {
    return this.source.lifetimeEnd;
  }

  readonly #renderLayer = new RenderLayer();

  protected override load(dependencies: ReadonlyDependencyContainer)
  {
    super.load(dependencies);

    this.source.lifetimeChanged.addListener(() => this.lifetimeChanged.emit(this));
  }

  public override createDrawNode(): PIXIContainer
  {
    return this.#renderLayer as any;
  }

  #isAttached = false;

  public override updateSubTreeTransforms(): boolean
  {
    if (this.source.isAlive && !this.#isAttached)
    {
      this.#renderLayer.attach(this.source.drawNode);
      this.#isAttached = true;
    }
    else if (!this.source.isAlive && this.#isAttached)
    {
      this.#renderLayer.detach(this.source.drawNode);
      this.#isAttached = false;
    }

    return super.updateSubTreeTransforms();
  }

  public override dispose()
  {
    super.dispose();

    this.#renderLayer.detachAll();
  }
}

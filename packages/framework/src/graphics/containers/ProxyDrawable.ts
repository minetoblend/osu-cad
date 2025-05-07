import type { Container as PIXIContainer } from "pixi.js";
import { RenderLayer } from "pixi.js";
import type { ReadonlyDependencyContainer } from "../../di/DependencyContainer";
import { Drawable } from "../drawables/Drawable";

export class ProxyDrawable extends Drawable
{
  constructor(readonly source: Drawable)
  {
    super();
  }

  override get isPresent(): boolean
  {
    return false;
  }

  override get shouldBeAlive(): boolean
  {
    return this.source.shouldBeAlive;
  }

  override get removeWhenNotAlive(): boolean
  {
    return this.source.removeWhenNotAlive;
  }

  override get lifetimeStart(): number
  {
    return this.source.lifetimeStart;
  }

  override get lifetimeEnd(): number
  {
    return this.source.lifetimeEnd;
  }

  readonly #renderLayer = new RenderLayer();

  protected override load(dependencies: ReadonlyDependencyContainer)
  {
    super.load(dependencies);

    this.#renderLayer.attach(this.source.drawNode);

    this.source.lifetimeChanged.addListener(() => this.lifetimeChanged.emit(this));
  }

  override createDrawNode(): PIXIContainer
  {
    return this.#renderLayer as any;
  }

  override updateDrawNodeTransform()
  {
  }

  override dispose(isDisposing: boolean = true)
  {
    super.dispose(isDisposing);

    this.#renderLayer.detachAll();
  }
}

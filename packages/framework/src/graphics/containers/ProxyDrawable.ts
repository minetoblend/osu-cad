import { RenderLayer } from 'pixi.js';
import type { ReadonlyDependencyContainer } from '../../di/DependencyContainer';
import type { Container as PIXIContainer } from 'pixi.js';
import { Drawable } from '../drawables/Drawable';

export class ProxyDrawable extends Drawable {
  constructor(readonly source: Drawable) {
    super();
  }

  #renderLayer = new RenderLayer();

  protected override load(dependencies: ReadonlyDependencyContainer) {
    super.load(dependencies);

    this.#renderLayer.attach(this.source.drawNode);

    this.source.onDispose(() => {
      this.#renderLayer.detachAll();
      this.expire();
    });
  }

  override createDrawNode(): PIXIContainer {
    return this.#renderLayer as any;
  }

  override updateDrawNodeTransform() {
  }

  override dispose(isDisposing: boolean = true) {
    super.dispose(isDisposing);

    this.#renderLayer.detachAll();
  }
}
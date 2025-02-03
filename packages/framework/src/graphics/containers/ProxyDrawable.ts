import type { Renderer } from 'pixi.js';
import type { ReadonlyDependencyContainer } from '../../di/DependencyContainer';
import type { PIXIContainer } from '../../pixi';
import { RenderContainer, RenderLayer } from 'pixi.js';
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

class ProxyDrawNode extends RenderContainer {
  constructor(readonly sourceDrawNode: PIXIContainer) {
    super({});

    sourceDrawNode.renderable = false;
    sourceDrawNode.enableRenderGroup();
  }

  override render(renderer: Renderer) {
    const { sourceDrawNode } = this;

    sourceDrawNode.renderable = true;
    renderer.renderPipes.renderGroup.execute(sourceDrawNode.renderGroup);

    sourceDrawNode.renderable = false;
  }
}

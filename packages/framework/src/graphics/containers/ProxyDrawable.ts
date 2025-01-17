import type { Renderer } from 'pixi.js';
import type { ReadonlyDependencyContainer } from '../../di/DependencyContainer';
import type { PIXIContainer } from '../../pixi';
import { RenderContainer } from 'pixi.js';
import { Drawable } from '../drawables/Drawable';

export class ProxyDrawable extends Drawable {
  constructor(readonly source: Drawable) {
    super();
  }

  protected override load(dependencies: ReadonlyDependencyContainer) {
    super.load(dependencies);

    this.source.onDispose(() => {
      this.drawNode.renderable = false;
      this.expire();
    });
  }

  override createDrawNode(): PIXIContainer {
    return new ProxyDrawNode(this.source.drawNode!);
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

import type { PIXIContainer } from 'osucad-framework';
import { Drawable, Invalidation, LayoutMember } from 'osucad-framework';
import { Graphics } from 'pixi.js';

export abstract class GraphicsDrawable extends Drawable {
  protected constructor() {
    super();

    this.addLayout(this.#graphicsBacking);
  }

  #graphics!: Graphics;

  #graphicsBacking = new LayoutMember(Invalidation.DrawSize);

  createDrawNode(): PIXIContainer {
    return this.#graphics = new Graphics();
  }

  override update() {
    super.update();

    if (!this.#graphicsBacking.isValid) {
      this.updateGraphics(this.#graphics);
      this.#graphicsBacking.validate();
    }
  }

  abstract updateGraphics(g: Graphics): void;

  protected invalidateGraphics() {
    this.#graphicsBacking.invalidate();
  }
}

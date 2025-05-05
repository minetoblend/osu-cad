import type { Container as PIXIContainer } from "pixi.js";
import { Graphics } from "pixi.js";
import { Drawable, Invalidation } from "./Drawable";
import { LayoutMember } from "./LayoutMember";

export abstract class GraphicsDrawable extends Drawable 
{
  protected constructor() 
  {
    super();

    this.addLayout(this.#graphicsBacking);
  }

  #graphics!: Graphics;

  #graphicsBacking = new LayoutMember(Invalidation.DrawSize);

  createDrawNode(): PIXIContainer 
  {
    return this.#graphics = new Graphics();
  }

  override update() 
  {
    super.update();

    if (!this.#graphicsBacking.isValid) 
    {
      this.updateGraphics(this.#graphics);
      this.#graphicsBacking.validate();
    }
  }

  abstract updateGraphics(g: Graphics): void;

  invalidateGraphics() 
  {
    this.#graphicsBacking.invalidate();
  }

  override dispose(isDisposing: boolean = true) 
  {
    super.dispose(isDisposing);

    this.#graphics.destroy();
  }
}

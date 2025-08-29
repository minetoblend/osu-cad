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

  protected createDrawNode(): PIXIContainer
  {
    return this.#graphics = new Graphics();
  }

  protected override update()
  {
    super.update();

    if (!this.#graphicsBacking.isValid)
    {
      this.updateGraphics(this.#graphics);
      this.#graphicsBacking.validate();
    }
  }

  protected abstract updateGraphics(g: Graphics): void;

  public invalidateGraphics()
  {
    this.#graphicsBacking.invalidate();
  }

  public override dispose()
  {
    super.dispose();

    this.#graphics.destroy();
  }
}

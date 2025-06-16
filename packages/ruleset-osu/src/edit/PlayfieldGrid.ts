import { Axes, GraphicsDrawable } from "@osucad/framework";
import type { Graphics } from "pixi.js";

export class PlayfieldGrid extends GraphicsDrawable
{

  constructor()
  {
    super();

    this.relativeSizeAxes = Axes.Both;
  }

  protected override updateGraphics(g: Graphics): void
  {
    g.clear()
      .rect(0, 0, this.drawWidth, this.drawHeight)
      .stroke({
        width: 0.5,
        color: 0xffffff,
        alpha: 0.5,
      });
  }
}

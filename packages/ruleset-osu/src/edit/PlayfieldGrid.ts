import { Axes, GraphicsDrawable } from "@osucad/framework";
import type { Graphics } from "pixi.js";

export class PlayfieldGrid extends GraphicsDrawable
{

  public constructor()
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

    const gridSize = 32;

    for (let x = gridSize; x < 512; x += gridSize)
      g.moveTo(x, 0).lineTo(x, 384);

    for (let y = gridSize; y < 384; y += gridSize)
      g.moveTo(0, y).lineTo(512, y);

    g.stroke({
      width: 0.5,
      color: 0xffffff,
      alpha: 0.25,
    });
  }
}

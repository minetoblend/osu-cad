import { GraphicsDrawable, Vec2 } from "@osucad/framework";
import type { Graphics } from "pixi.js";

export class DashedLine extends GraphicsDrawable
{
  public constructor()
  {
    super();
  }

  public get startPosition()
  {
    return this.#startPosition;
  }

  public set startPosition(value)
  {
    this.#startPosition = value;
    this.invalidateGraphics();
  }

  public get endPosition()
  {
    return this.#endPosition;
  }

  public set endPosition(value)
  {
    this.#endPosition = value;
    this.invalidateGraphics();
  }

  #startPosition = Vec2.zero();

  #endPosition = Vec2.zero();

  protected override updateGraphics(g: Graphics): void
  {
    g.clear();

    const position = this.#startPosition;
    const distance = this.#endPosition.distance(position);

    if (distance === 0)
      return;

    const direction = this.#endPosition.sub(position).normalize();

    const dashLength = 3;

    for (let d1 = 0; d1 < distance; d1 += dashLength * 2)
    {
      const d2 = Math.min(d1 + dashLength, distance);

      const p1 = position.add(direction.scale(d1));
      const p2 = position.add(direction.scale(d2));

      g.moveTo(p1.x, p1.y).lineTo(p2.x, p2.y);
    }

    g.stroke({
      width: 1,
      color: 0xffffff,
    });
  }
}

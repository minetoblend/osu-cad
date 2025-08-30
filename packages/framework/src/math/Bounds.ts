import { Rectangle } from "./Rectangle";
import type { IVec2 } from "./Vec2";

export class BoundsBuilder
{
  public value?: {
    minX: number,
    minY: number,
    maxX: number,
    maxY: number,
  };

  public addPoint(p: IVec2)
  {
    if (!this.value)
    {
      this.value = { minX: p.x, minY: p.y, maxX: p.x, maxY: p.y };
      return;
    }

    const value = this.value;

    if (p.x < value.minX)
      value.minX = p.x;
    if (p.y < value.minY)
      value.minY = p.y;

    if (p.x > value.maxX)
      value.maxX = p.x;
    if (p.y > value.maxY)
      value.maxY = p.y;
  }

  public addRect(rect: Rectangle)
  {
    const { x, y, right, bottom } = rect;

    if (!this.value)
    {
      this.value = { minX: x, minY: y, maxX: right, maxY: bottom };
      return;
    }

    const value = this.value;

    if (x < value.minX)
      value.minX = x;
    if (y < value.minY)
      value.minY = y;

    if (right > value.maxX)
      value.maxX = right;
    if (bottom > value.maxY)
      value.maxY = bottom;
  }

  public rect()
  {
    if (!this.value)
      return null;

    const { minX, minY, maxX, maxY } = this.value;

    return new Rectangle(
        minX,
        minY,
        maxX - minX,
        maxY - minY,
    );
  }
}

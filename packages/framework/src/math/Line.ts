import { clamp } from "../utils/clamp";
import { Vec2 } from "./Vec2";

export class Line
{
  constructor(readonly startPoint: Vec2, readonly endPoint: Vec2)
  {
  }

  closestPoint(position: Vec2)
  {
    return Line.closestPoint(this.startPoint, this.endPoint, position);
  }

  static closestPoint(startPoint: Vec2, endPoint: Vec2, position: Vec2)
  {
    const d2 = startPoint.distanceSq(endPoint);

    if (d2 === 0)
      return startPoint;

    const t = clamp((
      (position.x - startPoint.x) * (endPoint.x - startPoint.x) +
      (position.y - startPoint.y) * (endPoint.y - startPoint.y)
    ) / d2, 0, 1);

    return new Vec2(
        startPoint.x + (endPoint.x - startPoint.x) * t,
        startPoint.y + (endPoint.y - startPoint.y) * t,
    );
  }

  static distanceSq(startPoint: Vec2, endPoint: Vec2, position: Vec2)
  {
    return this.closestPoint(startPoint, endPoint, position).distanceSq(position);
  }

  static distance(startPoint: Vec2, endPoint: Vec2, position: Vec2)
  {
    return this.closestPoint(startPoint, endPoint, position).distance(position);
  }

  get theta()
  {
    return Math.atan2(this.endPoint.y - this.startPoint.y, this.endPoint.x - this.startPoint.x);
  }

  get direction()
  {
    return this.endPoint.sub(this.startPoint);
  }

  get directionNormalized()
  {
    return this.direction.normalize();
  }

  get orthogonalDirection()
  {
    const dir = this.directionNormalized;
    return new Vec2(-dir.y, dir.x);
  }

  distance(p: Vec2)
  {
    return Line.distance(this.startPoint, this.endPoint, p);
  }
}

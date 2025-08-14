import { Vec2 } from "./Vec2";

export class Line
{
  constructor(readonly startPoint: Vec2, readonly endPoint: Vec2)
  {
  }

  closestPoint(position: Vec2)
  {
    if (this.startPoint.equals(this.endPoint))
      return this.startPoint;

    const dir = this.endPoint.sub(this.startPoint).normalize();

    const v = position.sub(this.startPoint);
    const d = v.dot(dir);
    return this.startPoint.add(dir.scale(d));
  }

  static closestPoint(startPoint: Vec2, endPoint: Vec2, position: Vec2)
  {
    if (startPoint.equals(endPoint))
      return startPoint;

    const dir = endPoint.sub(startPoint).normalize();

    const v = position.sub(startPoint);
    const d = v.dot(dir);
    return startPoint.add(dir.scaleInPlace(d));
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

  distanceToPoint(p: Vec2)
  {
    return this.closestPoint(p).distance(p);
  }
}

import { Vec2 } from './Vec2';

export class Line {
  constructor(readonly startPoint: Vec2, readonly endPoint: Vec2) {
  }

  closestPoint(position: Vec2) {
    if (this.startPoint.equals(this.endPoint))
      return this.startPoint;

    const dir = this.endPoint.sub(this.startPoint).normalize();

    const v = position.sub(this.startPoint);
    const d = v.dot(dir);
    return this.startPoint.add(dir.scale(d));
  }

  get theta() {
    return Math.atan2(this.endPoint.y - this.startPoint.y, this.endPoint.x - this.startPoint.x);
  }

  get direction() {
    return this.endPoint.sub(this.startPoint);
  }

  get directionNormalized() {
    return this.direction.normalize();
  }

  get orthogonalDirection() {
    const dir = this.directionNormalized;
    return new Vec2(-dir.y, dir.x);
  }
}

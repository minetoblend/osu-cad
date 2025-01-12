import type { Vec2 } from './Vec2';

export class Line {
  constructor(readonly start: Vec2, readonly end: Vec2) {
  }

  closestPoint(position: Vec2) {
    if (this.start.equals(this.end))
      return this.start;

    const dir = this.end.sub(this.start).normalize();

    const v = position.sub(this.start);
    const d = v.dot(dir);
    return this.start.add(dir.scale(d));
  }
}

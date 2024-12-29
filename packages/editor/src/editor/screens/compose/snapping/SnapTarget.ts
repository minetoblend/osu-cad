import type { Vec2 } from 'osucad-framework';
import type { Graphics } from 'pixi.js';

export abstract class SnapTarget {
  abstract getSnapOffset(positions: Vec2[]): Vec2 | null;

  draw(g: Graphics, active: boolean = false) {}

  get bypassRadius() {
    return false;
  }
}

export class PositionSnapTarget extends SnapTarget {
  constructor(
    readonly position: Vec2,
    readonly radius?: number
  ) {
    super();
  }

  getSnapOffset(positions: Vec2[]): Vec2 | null {
    let closest: Vec2 | null = null;
    let closestDistance = Number.MAX_VALUE;

    for (const p of positions) {
      const distance = p.distance(this.position);
      if (distance < closestDistance) {
        closestDistance = distance;
        closest = p;
      }
    }

    if (closest) {
      return this.position.sub(closest);
    }

    return null;
  }

  get x() {
    return this.position.x;
  }

  get y() {
    return this.position.y;
  }

  override draw(g: Graphics, active: boolean = false) {
    g
      .circle(this.x, this.y, active ? 4 : 3)
      .fill({
        color: 0x000000,
        alpha: 0.075,
      })
      .circle(this.x, this.y, active ? 3 : 2)
      .fill({
        color: 0xFFFFFF,
        alpha: active ? 1 : 0.5,
      });
  }
}

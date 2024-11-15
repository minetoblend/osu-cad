import type { IVec2, Vec2 } from 'osucad-framework';
import { clamp } from 'osucad-framework';

export class CalculatedPath {
  constructor(
    readonly vertices: Vec2[] = [],
    readonly cumulativeDistance: number[] = [],
  ) {
    if (vertices.length !== cumulativeDistance.length) {
      throw new Error('Vertices and cumulativeDistance must have the same length.');
    }
  }

  get length() {
    return this.vertices.length;
  }

  getPositionAtDistance<T extends IVec2>(d: number, out: T): T {
    if (this.vertices.length <= 1) {
      out.x = 0;
      out.y = 0;
      return out;
    }
    let i = 0;
    const vertices = this.vertices;
    const cumulativeDistance = this.cumulativeDistance;
    while (i < cumulativeDistance.length - 1) {
      if (cumulativeDistance[i + 1] > d)
        break;
      i++;
    }

    const start = vertices[i];
    const end = vertices[i + 1];
    const distance = cumulativeDistance[i + 1] - cumulativeDistance[i];
    let t = (d - cumulativeDistance[i]) / distance;

    t = clamp(t, 0, 1);

    if (!end) {
      out.x = start.x;
      out.y = start.y;
      return out;
    }

    out.x = start.x + (end.x - start.x) * t;
    out.y = start.y + (end.y - start.y) * t;

    return out;
  }
}

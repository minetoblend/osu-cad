import { Vec2, clamp } from 'osucad-framework';

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

  getPositionAtDistance(d: number): Vec2 {
    if (this.vertices.length <= 1)
      return new Vec2();
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

    if (!end)
      return start;

    return new Vec2(
      start.x + (end.x - start.x) * t,
      start.y + (end.y - start.y) * t,
    );
  }
}

import type { CalculatedPath } from './CalculatedPath';
import { Vec2 } from 'osucad-framework';

export class PathRange {
  constructor(
    readonly calculatedPath: CalculatedPath,
    readonly start: number,
    readonly end: number,
  ) {
    const d0 = start;
    const d1 = end;

    const vertices = calculatedPath.vertices;
    const cumulativeDistance = calculatedPath.cumulativeDistance;

    function interpolateVertices(i: number, d: number) {
      if (vertices.length === 0)
        return Vec2.zero();

      if (i <= 0)
        return vertices[0];
      if (i >= vertices.length)
        return vertices[vertices.length - 1];

      const p0 = vertices[i - 1];
      const p1 = vertices[i];

      const d0 = cumulativeDistance[i - 1];
      const d1 = cumulativeDistance[i];

      // Avoid division by and almost-zero number in case two points are extremely close to each other.
      if (Math.abs(d0 - d1) < 0.001)
        return p0;

      const w = (d - d0) / (d1 - d0);
      return Vec2.lerp(p0, p1, w);
    }

    let i = 0;

    // eslint-disable-next-line no-empty
    for (; i < vertices.length && cumulativeDistance[i] < d0; ++i) {
    }

    const path: Vec2[] = [];
    path.push(interpolateVertices(i, d0));

    for (; i < vertices.length && cumulativeDistance[i] <= d1; ++i) {
      const p = vertices[i];
      if (!Vec2.equals(path[path.length - 1], p))
        path.push(p);
    }

    const p = interpolateVertices(i, d1);
    if (!Vec2.equals(path[path.length - 1], p))
      path.push(p);

    this.path = path;
  }

  readonly path: Vec2[];

  get endPosition() {
    return this.path[this.path.length - 1];
  }
}

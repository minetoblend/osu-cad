import type { IVec2 } from "@osucad/framework";
import { clamp, Vec2 } from "@osucad/framework";

export class CalculatedPath
{
  constructor(
    readonly vertices: Vec2[] = [],
    readonly cumulativeDistance: number[] = [],
  )
  {
  }

  get length()
  {
    return this.vertices.length;
  }

  get totalDistance()
  {
    return this.cumulativeDistance[this.cumulativeDistance.length - 1] ?? 0;
  }

  getPositionAtDistance<T extends IVec2>(d: number, out: T): T
  {
    if (this.vertices.length <= 1)
    {
      out.x = 0;
      out.y = 0;
      return out;
    }
    let i = 0;
    const vertices = this.vertices;
    const cumulativeDistance = this.cumulativeDistance;
    while (i < cumulativeDistance.length - 1)
    {
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
    {
      out.x = start.x;
      out.y = start.y;
      return out;
    }

    out.x = start.x + (end.x - start.x) * t;
    out.y = start.y + (end.y - start.y) * t;

    return out;
  }

  getRange(d0: number, d1: number)
  {

    const vertices = this.vertices;
    const cumulativeDistance = this.cumulativeDistance;

    function interpolateVertices(i: number, d: number)
    {
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


    for (; i < vertices.length && cumulativeDistance[i] < d0; ++i)
    {
      /* empty */
    }

    const path: Vec2[] = [];
    path.push(interpolateVertices(i, d0));

    for (; i < vertices.length && cumulativeDistance[i] <= d1; ++i)
    {
      const p = vertices[i];
      if (!Vec2.equals(path[path.length - 1], p))
        path.push(p);
    }

    const p = interpolateVertices(i, d1);
    if (!Vec2.equals(path[path.length - 1], p))
      path.push(p);

    return path;
  }
}

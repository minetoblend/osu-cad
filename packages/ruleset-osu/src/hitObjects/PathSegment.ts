import { PathApproximator } from "@osucad/core";
import type { PathPoint } from "./PathPoint";
import { PathType } from "./PathPoint";
import type { Vec2 } from "@osucad/framework";

export class PathSegment
{
  public constructor(
    public readonly type: PathType,
    public readonly pathPoints: PathPoint[],
  )
  {
  }

  public get points()
  {
    return this.pathPoints.map(it => it.position.clone());
  }

  #vertices?: Vec2[];

  public get vertices()
  {
    this.#vertices ??= this.#getVertices();

    return this.#vertices;
  }

  #getVertices()
  {
    switch(this.type)
    {
    case PathType.Catmull:
      return PathApproximator.approximateCatmull(this.points);
    case PathType.Linear:
      return this.points;
    case PathType.BSpline:
      return PathApproximator.approximateBSpline(this.points, 3);
    case PathType.PerfectCurve:
      if (this.points.length === 3)
        return PathApproximator.approximateCircularArc(this.points, 1000);
      else
        return PathApproximator.approximateBezier(this.points);
    default:
      return PathApproximator.approximateBezier(this.points);
    }
  }

  public get distance()
  {
    let distance = 0;

    const vertices = this.vertices;

    for (let i = 0; i < vertices.length - 1; i++)
      distance += vertices[i].distance(vertices[i+1]);

    return distance;
  }
}

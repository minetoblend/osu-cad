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

  public static fromPathPoints(controlPoints: PathPoint[])
  {
    let segmentStart = 0;
    let segmentType = controlPoints[0]?.type ?? PathType.Bezier;

    const segments: PathSegment[] = [];

    for (let i = 0; i< controlPoints.length; i++)
    {
      const controlPoint = controlPoints[i];

      if (controlPoint.type !== null || i === controlPoints.length - 1)
      {
        const points = controlPoints.slice(segmentStart, i + 1);

        if (points.length < 2)
          continue;

        segments.push( new PathSegment(segmentType, points));

        segmentStart = i;
        segmentType = controlPoint.type!;
      }
    }

    return segments;
  }

  public get points()
  {
    return this.pathPoints.map(it => it.position.clone());
  }

  #vertices?: Vec2[];
  #cumulativeDistance?: number[];

  public get vertices(): Vec2[]
  {
    this.#ensureVertices();

    return this.#vertices!;
  }

  public get cumulativeDistance(): number[]
  {
    this.#ensureVertices();

    return this.#cumulativeDistance!;
  }

  #ensureVertices()
  {
    if (this.#vertices)
      return;

    const vertices = this.#vertices = this.#getVertices();
    if(vertices.length === 0)
    {
      this.#cumulativeDistance = [];
      return;
    }

    const cumulativeDistance = [0];
    let last = vertices[0];

    for (let i = 1; i < vertices.length; i++)
    {
      const p = vertices[i];

      const distance = p.distance(last);

      cumulativeDistance[i] = cumulativeDistance[i - 1] + distance;

      last = p;
    }

    this.#cumulativeDistance = cumulativeDistance;
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
    return this.cumulativeDistance[this.cumulativeDistance.length - 1] ?? 0;
  }
}

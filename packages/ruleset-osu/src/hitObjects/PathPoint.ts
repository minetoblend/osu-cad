import type { Vec2 } from "@osucad/framework";

export enum PathType
{
  Linear = 0,
  PerfectCurve = 1,
  Catmull = 2,
  Bezier = 3,
  BSpline = 4,
}

export namespace PathType
{
  export function next(type: PathType)
  {
    switch (type)
    {
    case PathType.Linear:
      return PathType.Bezier;
    case PathType.PerfectCurve:
      return PathType.Bezier;
    case PathType.Bezier:
      return PathType.BSpline;
    case PathType.BSpline:
      return PathType.Catmull;
    case PathType.Catmull:
      return PathType.Linear;
    }
  }

  export function nextOrNull(type: PathType | null)
  {
    switch (type)
    {
    case null:
      return PathType.Linear;
    case PathType.Catmull:
      return null;
    default:
      return next(type);
    }
  }

  export function nextAtIndex(type: PathType | null, index: number)
  {
    if (index > 0 || type === null)
      return nextOrNull(type);

    return next(type);
  }
}

export class PathPoint
{
  constructor(
    readonly position: Vec2,
    readonly type: PathType | null = null,
  )
  {
  }

  withPosition(position: Vec2)
  {
    return new PathPoint(position, this.type);
  }

  withType(type: PathType | null)
  {
    return new PathPoint(this.position, type);
  }

  withNextType(index: number)
  {
    return this.withType(PathType.nextAtIndex(this.type, index));
  }
}

import { Vec2 } from "@osucad/framework";
import type { Matrix } from "pixi.js";
import { serializer } from "@osucad/multiplayer-core";

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
    case PathType.Bezier:
      return PathType.PerfectCurve;
    case PathType.PerfectCurve:
      return PathType.Linear;
    case PathType.Linear:
      return PathType.BSpline;
    case PathType.BSpline:
      return PathType.Catmull;
    case PathType.Catmull:
      return PathType.Bezier;
    }
  }

  export function previous(type: PathType)
  {
    switch (type)
    {
    case PathType.Bezier:
      return PathType.Catmull;
    case PathType.Catmull:
      return PathType.BSpline;
    case PathType.BSpline:
      return PathType.Linear;
    case PathType.Linear:
      return PathType.PerfectCurve;
    case PathType.PerfectCurve:
      return PathType.Bezier;
    }
  }

  export function nextOrNull(type: PathType | null)
  {
    switch (type)
    {
    case null:
      return PathType.Bezier;
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
  public constructor(
    public readonly position: Vec2,
    public readonly type: PathType | null = null,
  )
  {
  }

  public withPosition(position: Vec2)
  {
    return new PathPoint(position, this.type);
  }

  public movedBy(offset: Vec2)
  {
    return this.withPosition(this.position.add(offset));
  }

  public rotated(angle: number)
  {
    return this.withPosition(this.position.rotate(angle));
  }

  public withType(type: PathType | null)
  {
    return new PathPoint(this.position, type);
  }

  public withNextType(index: number)
  {
    return this.withType(PathType.nextAtIndex(this.type, index));
  }

  public transform(matrix: Matrix)
  {
    return this.withPosition(matrix.apply(this.position, new Vec2()));
  }

  public static readonly listSerializer = serializer<readonly PathPoint[], [number, number, PathType | null][]>({
    serialize: value => value.map(p => [Math.round(p.position.x), Math.round(p.position.y), p.type]),
    deserialize: value => value.map(([x, y, type]) => new PathPoint(new Vec2(x, y), type)),
  });
}


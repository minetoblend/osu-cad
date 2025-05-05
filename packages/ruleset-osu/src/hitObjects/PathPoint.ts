import { Vec2 } from "@osucad/framework";

export enum PathType 
{
  Linear = 0,
  PerfectCurve = 1,
  Catmull = 2,
  Bezier = 3,
  BSpline = 4,
}

export class PathPoint 
{
  constructor(
    readonly position: Vec2,
    readonly type: PathType | null = null,
  ) 
  {
  }
}

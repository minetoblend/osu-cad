import type { HitObject } from "@osucad/core";
import type { Vec2 } from "@osucad/framework";

export interface ISnapOptions
{
  ignore?: HitObject[]
}

export interface ISnapProvider
{
  getSnapResults(targets: Vec2[], options?: ISnapOptions): Iterable<SnapResult>
}

export class SnapResult
{
  public constructor(public readonly source: Vec2, public readonly target: Vec2)
  {
  }

  public get distance()
  {
    return this.source.distance(this.target);
  }

  public get offset()
  {
    return this.target.sub(this.source);
  }
}

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
  constructor(readonly source: Vec2, readonly target: Vec2)
  {
  }

  get distance()
  {
    return this.source.distance(this.target);
  }

  get offset()
  {
    return this.target.sub(this.source);
  }
}

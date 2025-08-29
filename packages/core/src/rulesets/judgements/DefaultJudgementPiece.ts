import { CompositeDrawable } from "@osucad/framework";
import type { HitResult } from "../scoring/HitResult";

// TODO
export class DefaultJudgementPiece extends CompositeDrawable
{
  public constructor(public readonly result: HitResult)
  {
    super();
  }

}

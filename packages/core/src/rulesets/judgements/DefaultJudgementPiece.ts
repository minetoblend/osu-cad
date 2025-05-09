import { CompositeDrawable } from "@osucad/framework";
import type { HitResult } from "../scoring/HitResult";

// TODO
export class DefaultJudgementPiece extends CompositeDrawable
{
  constructor(readonly result: HitResult)
  {
    super();
  }

}

import { SkinComponentLookup } from "../../skinning/SkinComponentLookup";
import type { HitResult } from "../scoring/HitResult";

export class HitResultComponentLookup extends SkinComponentLookup
{
  public constructor(public readonly type: HitResult)
  {
    super();
  }
}

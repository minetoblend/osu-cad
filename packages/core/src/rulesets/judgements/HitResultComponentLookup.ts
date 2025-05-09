import { SkinComponentLookup } from "../../skinning/SkinComponentLookup";
import type { HitResult } from "../scoring/HitResult";

export class HitResultComponentLookup extends SkinComponentLookup
{
  constructor(readonly type: HitResult)
  {
    super();
  }
}

import type { DDSAttributes } from "@osucad/multiplayer-core";
import type { OsuHitObjectOptions } from "./OsuHitObject";
import { OsuHitObject } from "./OsuHitObject";

export class HitCircle extends OsuHitObject
{
  public static readonly attributes: DDSAttributes = {
    type: "@osucad/hitcircle",
    version: 0,
  };

  public constructor(options?: OsuHitObjectOptions)
  {
    super(HitCircle.attributes, options);
  }
}

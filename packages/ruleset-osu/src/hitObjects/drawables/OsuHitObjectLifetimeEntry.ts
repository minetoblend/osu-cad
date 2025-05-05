import { HitObjectLifetimeEntry } from "@osucad/core";
import type { OsuHitObject } from "../OsuHitObject";

export class OsuHitObjectLifetimeEntry extends HitObjectLifetimeEntry
{
  constructor(hitObject: OsuHitObject)
  {
    super(hitObject);

    this.lifetimeEnd = hitObject.endTime + 700;
  }

  override get initialLifetimeOffset()
  {
    return (this.hitObject as OsuHitObject).timePreempt;
  }
}

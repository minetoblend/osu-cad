import { HitObjectLifetimeEntry } from "@osucad/core";
import type { OsuHitObject } from "../OsuHitObject";

export class OsuHitObjectLifetimeEntry extends HitObjectLifetimeEntry
{
  public constructor(hitObject: OsuHitObject)
  {
    super(hitObject);

    this.lifetimeEnd = hitObject.endTime + 700;
  }

  public override get initialLifetimeOffset()
  {
    return (this.hitObject as OsuHitObject).timePreempt;
  }
}

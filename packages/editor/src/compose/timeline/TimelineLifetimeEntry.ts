import { HitObjectLifetimeEntry, type HitObject } from "@osucad/core";
import { Bindable } from "@osucad/framework";


export class TimelineLifetimeEntry extends HitObjectLifetimeEntry
{
  public constructor(hitObject: HitObject)
  {
    super(hitObject);

    hitObject.defaultsApplied.addListener(this.setInitialLifetime, this);
  }

  public readonly selected = new Bindable(false);

  protected override setInitialLifetime(): void
  {
    super.setInitialLifetime();
    this.lifetimeEnd = this.hitObject.endTime;
  }

  public override get initialLifetimeOffset(): number
  {
    return 0;
  }
}

import { Bindable } from "@osucad/framework";
import { LifetimeEntry } from "../../../pooling/LifetimeEntry";
import type { HitObject } from "../HitObject";

export class HitObjectLifetimeEntry extends LifetimeEntry
{

  readonly #startTimeBindable = new Bindable(0);

  constructor(readonly hitObject: HitObject)
  {
    super();

    this.#startTimeBindable.bindTo(hitObject.startTimeBindable);
    this.#startTimeBindable.valueChanged.addListener(this.setInitialLifetime, this);

    this.setInitialLifetime();
  }

  protected override setLifetimeStart(start: number)
  {
    super.setLifetimeStart(start);
  }

  get initialLifetimeOffset()
  {
    return 10_000;
  }

  protected setInitialLifetime()
  {
    this.lifetimeStart = this.hitObject.startTime - this.initialLifetimeOffset;
  }
}

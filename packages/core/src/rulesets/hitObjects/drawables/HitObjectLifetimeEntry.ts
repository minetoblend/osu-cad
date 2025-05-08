import { Bindable } from "@osucad/framework";
import { LifetimeEntry } from "@osucad/framework";
import type { HitObject } from "../HitObject";
import type { JudgementResult } from "../../judgements/JudgementResult";

export class HitObjectLifetimeEntry extends LifetimeEntry
{

  readonly #startTimeBindable = new Bindable(0);

  nestedEntries = new Set<HitObjectLifetimeEntry>();

  result: JudgementResult | null = null;

  get judged()
  {
    return this.result?.hasResult ?? false;
  }

  get allJudged()
  {
    if (!this.judged)
      return false;

    for (const entry of this.nestedEntries)
    {
      if (!entry.allJudged)
        return false;
    }

    return true;
  }

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

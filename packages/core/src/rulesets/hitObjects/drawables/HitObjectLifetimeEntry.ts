import { Action, Bindable } from "@osucad/framework";
import { LifetimeEntry } from "@osucad/framework";
import type { HitObject } from "../HitObject";
import type { JudgementResult } from "../../judgements/JudgementResult";

export class HitObjectLifetimeEntry extends LifetimeEntry
{

  readonly #startTimeBindable = new Bindable(0);

  public readonly revertResult = new Action();

  public nestedEntries = new Set<HitObjectLifetimeEntry>();

  public result: JudgementResult | null = null;

  public get judged()
  {
    return this.result?.hasResult ?? false;
  }

  public get allJudged()
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

  public constructor(public readonly hitObject: HitObject)
  {
    super();

    this.#startTimeBindable.bindTo(hitObject.startTimeBindable);
    this.#startTimeBindable.valueChanged.addListener(this.setInitialLifetime, this);

    this.setInitialLifetime();
  }

  #realLifetimeStart = -Number.MIN_VALUE;
  #realLifetimeEnd = Number.MAX_VALUE;

  protected override setLifetimeStart(start: number)
  {
    this.#realLifetimeStart = start;

    if (!this.#keepAlive)
      super.setLifetimeStart(start);
  }

  protected override setLifetimeEnd(end: number)
  {
    this.#realLifetimeEnd = end;

    if (!this.#keepAlive)
      super.setLifetimeEnd(end);
  }

  #keepAlive = false;

  public get keepAlive()
  {
    return this.#keepAlive;
  }

  public set keepAlive(value)
  {
    if (this.#keepAlive === value)
      return;

    this.#keepAlive = value;
    if (value)
      this.setLifetime(-Number.MAX_VALUE, Number.MAX_VALUE);
    else
      this.setLifetime(this.#realLifetimeStart, this.#realLifetimeEnd);
  }

  public get initialLifetimeOffset()
  {
    return 10_000;
  }

  protected setInitialLifetime()
  {
    this.lifetimeStart = this.hitObject.startTime - this.initialLifetimeOffset;
  }

  public onRevertResult()
  {
    this.revertResult.emit();
  }

}

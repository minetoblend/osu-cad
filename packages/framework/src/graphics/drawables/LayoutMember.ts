import type { Drawable, Invalidation } from "./Drawable";
import { FrameStatistics } from "../../statistics/FrameStatistics";
import { StatisticsCounterType } from "../../statistics/StatisticsCounterType";
import { InvalidationSource } from "./Drawable";

export class LayoutMember
{
  public constructor(
    public readonly invalidation: Invalidation,
    public readonly source: InvalidationSource = InvalidationSource.Default,
    public readonly condition?: (drawable: Drawable, invalidation: Invalidation) => boolean,
  )
  {
  }

  public parent?: Drawable;

  #isValid = false;

  public get isValid()
  {
    return this.#isValid;
  }

  public invalidate()
  {
    if (!this.#isValid)
      return;

    this.#isValid = false;
    FrameStatistics.increment(StatisticsCounterType.Invalidations);
  }

  public validate()
  {
    if (!this.#isValid)
    {
      this.#isValid = true;
      if (this.validateParent)
        this.parent?.validateSuperTree(this.invalidation);
      FrameStatistics.increment(StatisticsCounterType.Refreshes);
    }
  }

  public validateParent = true;
}

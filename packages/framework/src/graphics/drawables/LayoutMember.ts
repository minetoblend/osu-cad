import type { Drawable, Invalidation } from "./Drawable";
import { FrameStatistics } from "../../statistics/FrameStatistics";
import { StatisticsCounterType } from "../../statistics/StatisticsCounterType";
import { InvalidationSource } from "./Drawable";

export class LayoutMember 
{
  constructor(
    readonly invalidation: Invalidation,
    readonly source: InvalidationSource = InvalidationSource.Default,
    readonly condition?: (drawable: Drawable, invalidation: Invalidation) => boolean,
  ) 
  {
  }

  parent?: Drawable;

  #isValid = false;

  get isValid() 
  {
    return this.#isValid;
  }

  invalidate() 
  {
    if (!this.#isValid)
      return;

    this.#isValid = false;
    FrameStatistics.increment(StatisticsCounterType.Invalidations);
  }

  validate() 
  {
    if (!this.#isValid) 
    {
      this.#isValid = true;
      if (this.validateParent)
        this.parent?.validateSuperTree(this.invalidation);
      FrameStatistics.increment(StatisticsCounterType.Refreshes);
    }
  }

  validateParent = true;
}

import { DrawableOsuHitObject } from "./DrawableOsuHitObject";
import type { SpinnerTick } from "../SpinnerTick";
import { Anchor } from "@osucad/framework";

export class DrawableSpinnerTick extends DrawableOsuHitObject<SpinnerTick>
{
  constructor(initialHitObject: SpinnerTick)
  {
    super(initialHitObject);

    this.anchor = this.origin = Anchor.Center;
  }

  protected override onApplied()
  {
    super.onApplied();

    this.lifetimeStart = Number.MAX_VALUE;
  }

  public triggerResult(hit: boolean)
  {
    if (hit)
      this.applyMaxResult();
    else
      this.applyMinResult();
  }

  protected override updatePosition(): void
  {
  }

  protected override updateScale(scale: number): void
  {
  }
}

import type { Drawable } from "@osucad/framework";
import { Anchor, Axes, EasingFunction } from "@osucad/framework";
import { FollowCircle } from "../FollowCircle";

export class LegacyFollowCircle extends FollowCircle
{

  constructor(animationContent: Drawable)
  {
    super();

    animationContent.scale = animationContent.scale.scale(0.5);
    animationContent.anchor = Anchor.Center;
    animationContent.origin = Anchor.Center;

    this.relativeSizeAxes = Axes.Both;
    this.internalChild = animationContent;
  }

  protected override onSliderPress(): void
  {
    const remainingTime = Math.max(0, this.parentObject.hitStateUpdateTime - this.time.current);

    this.scaleTo(1).scaleTo(2, Math.min(180, remainingTime), EasingFunction.Out)
      .fadeTo(0).fadeTo(1, Math.min(60, remainingTime));
  }

  protected override onSliderRelease(): void
  {
  }

  protected override onSliderEnd(): void
  {
    this.scaleTo(1.6, 200, EasingFunction.Out)
      .fadeOut(200, EasingFunction.In);
  }

  protected override onSliderTick(): void
  {
    if (this.scale.x >= 2)
    {
      this.scaleTo(2.2)
        .scaleTo(2, 200);
    }
  }

  protected override onSliderBreak(): void
  {
    this.scaleTo(4, 100)
      .fadeTo(0, 100);
  }
}

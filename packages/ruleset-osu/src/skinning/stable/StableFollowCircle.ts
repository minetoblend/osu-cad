import type { Drawable } from '@osucad/framework';
import { ISkinSource } from '@osucad/core';
import { Anchor, Axes, EasingFunction, resolved } from '@osucad/framework';
import { FollowCircle } from '../FollowCircle';

export class StableFollowCircle extends FollowCircle {
  constructor(animationContent: Drawable) {
    super();

    animationContent.scale = animationContent.scale.scale(0.5);
    animationContent.anchor = Anchor.Center;
    animationContent.origin = Anchor.Center;

    this.relativeSizeAxes = Axes.Both;
    this.internalChild = animationContent;
  }

  @resolved(ISkinSource)
  skin!: ISkinSource;

  protected override onSliderPress() {
    const remainingTime = Math.max(0, this.parentObject!.hitStateUpdateTime - this.time.current);

    // Note that the scale adjust here is 2 instead of DrawableSliderBall.FOLLOW_AREA to match legacy behaviour.
    // This means the actual tracking area for gameplay purposes is larger than the sprite (but skins may be accounting for this).
    this.scaleTo(1)
      .scaleTo(2, Math.min(180, remainingTime), EasingFunction.Out)
      .fadeTo(0)
      .fadeTo(1, Math.min(60, remainingTime));
  }

  protected override onSliderRelease() {
    this.onSliderEnd();
  }

  protected override onSliderEnd() {
    this.scaleTo(1.6, 200, EasingFunction.Out)
      .fadeOut(200, EasingFunction.In);
  }

  protected override onSliderTick() {
    if (this.scale.x >= 2)
      this.scaleTo(2.2).scaleTo(2, 200);
  }

  protected override onSliderBreak() {
    this.scaleTo(4, 100)
      .fadeTo(0, 100);
  }
}

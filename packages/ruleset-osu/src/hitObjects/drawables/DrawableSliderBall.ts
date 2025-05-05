import { SkinnableDrawable } from "@osucad/core";
import type { ReadonlyDependencyContainer } from "@osucad/framework";
import { Anchor, Axes, CompositeDrawable, resolved } from "@osucad/framework";
import { OsuSkinComponents } from "../../skinning/OsuSkinComponents";
import { OsuHitObject } from "../OsuHitObject";
import { DrawableSlider } from "./DrawableSlider";

export class DrawableSliderBall extends CompositeDrawable 
{
  static readonly FOLLOW_AREA = 2.4;

  @resolved(() => DrawableSlider)
  private drawableSlider!: DrawableSlider;

  private ball!: SkinnableDrawable;

  protected override load(dependencies: ReadonlyDependencyContainer) 
  {
    super.load(dependencies);

    this.size = OsuHitObject.OBJECT_DIMENSIONS;
    this.origin = Anchor.Center;

    this.addAllInternal(
        new SkinnableDrawable(OsuSkinComponents.SliderFollowCircle).with({
          relativeSizeAxes: Axes.Both,
          anchor: Anchor.Center,
          origin: Anchor.Center,
        }),
        this.ball = new SkinnableDrawable(OsuSkinComponents.SliderBall).with({
          relativeSizeAxes: Axes.Both,
          anchor: Anchor.Center,
          origin: Anchor.Center,
        }),
    );
  }

  override clearTransformsAfter(time: number, propagateChildren?: boolean, targetMember?: string) 
  {
    super.clearTransformsAfter(time, false, targetMember);
  }

  override applyTransformsAt(time: number) 
  {
    super.applyTransformsAt(time, false);
  }

  updateProgress(completionProgress: number) 
  {
    const slider = this.drawableSlider.hitObject!;

    const position = this.position = slider.curvePositionAt(completionProgress);

    const diff = position.sub(slider.curvePositionAt(Math.min(1, completionProgress + 0.1 / slider.path.expectedDistance)));

    if (diff.length() < 0.05)
      return;

    this.ball.rotation = -Math.atan2(diff.x, diff.y) - Math.PI * 0.5;
  }
}

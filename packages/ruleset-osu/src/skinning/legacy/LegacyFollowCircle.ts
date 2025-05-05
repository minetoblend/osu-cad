import { DrawableHitObject } from "@osucad/core";
import { Anchor, Axes, CompositeDrawable, Drawable, EasingFunction, resolved } from "@osucad/framework";
import { DrawableSlider } from "../../hitObjects/drawables/DrawableSlider";
import { Slider } from "../../hitObjects/Slider";

export class LegacyFollowCircle extends CompositeDrawable {
  @resolved(() => DrawableSlider)
  parentObject!: DrawableSlider

  constructor(animationContent: Drawable) {
    super();

    animationContent.scale = animationContent.scale.scale(0.5);
    animationContent.anchor = Anchor.Center;
    animationContent.origin = Anchor.Center;

    this.relativeSizeAxes = Axes.Both;
    this.internalChild = animationContent;
  }

  protected override loadComplete() {
    super.loadComplete();

    this.parentObject.applyCustomUpdateState.addListener(this.applyCustomStateTransforms, this)

    this.applyCustomStateTransforms(this.parentObject)
  }

  protected applyCustomStateTransforms(drawableObject: DrawableHitObject) {
    this.applyTransformsAt(-Number.MAX_VALUE, true)
    this.clearTransformsAfter(-Number.MAX_VALUE, true)

    const slider = drawableObject.hitObject as Slider

    const remainingTime = slider.duration;

    if (slider.path.controlPoints.length === 0 || slider.path.expectedDistance <= 0) {
      this.fadeOut();
      return;
    }

    this.absoluteSequence({ time: slider.startTime, recursive: true }, () => {
      this.scaleTo(1)
          .scaleTo(2, Math.min(180, remainingTime), EasingFunction.Out)

      this.fadeInFromZero(Math.min(60, remainingTime));
    })

    this.absoluteSequence(slider.endTime, () => {
      this.scaleTo(1.6, 200, EasingFunction.Out)
          .fadeOut(200, EasingFunction.In);
    });
  }

  public override dispose(isDisposing: boolean = true) {
    super.dispose(isDisposing);

    this.parentObject.applyCustomUpdateState.removeListener(this.applyCustomStateTransforms, this)
  }
}
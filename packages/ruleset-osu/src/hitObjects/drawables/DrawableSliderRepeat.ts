import type { Drawable, ReadonlyDependencyContainer } from "@osucad/framework";
import { Anchor, clamp, EasingFunction, Interpolation, provide, Vec2 } from "@osucad/framework";
import { OsuHitObject } from "../OsuHitObject";
import type { ArmedState } from "@osucad/core";
import { SkinnableDrawable } from "@osucad/core";
import { OsuSkinComponents } from "../../skinning";
import { DrawableOsuHitObject } from "./DrawableOsuHitObject";
import { DrawableSlider } from "./DrawableSlider";
import type { SliderRepeat } from "../SliderRepeat";
import type { PlaySliderBody } from "./PlaySliderBody";

@provide(DrawableSliderRepeat)
export class DrawableSliderRepeat extends DrawableOsuHitObject<SliderRepeat>
{
  constructor()
  {
    super();
  }

  get drawableSlider(): DrawableSlider | null
  {
    if (this.parentHitObject instanceof DrawableSlider)
      return this.parentHitObject;

    return null;
  }

  circlePiece!: SkinnableDrawable;

  arrow!: SkinnableDrawable;

  protected override load(dependencies: ReadonlyDependencyContainer)
  {
    super.load(dependencies);

    this.origin = Anchor.Center;
    this.size = OsuHitObject.OBJECT_DIMENSIONS;

    this.addRangeInternal([
      this.circlePiece = new SkinnableDrawable(OsuSkinComponents.SliderTailHitCircle).with({
        anchor: Anchor.Center,
        origin: Anchor.Center,
      }),
      this.arrow = new SkinnableDrawable(OsuSkinComponents.ReverseArrow).with({
        anchor: Anchor.Center,
        origin: Anchor.Center,
      }),
    ]);
  }

  protected override updatePosition(): void
  {
    if (this.drawableSlider)
      this.position = this.hitObject.position.sub(this.drawableSlider.hitObject.position);
  }

  protected override updateScale(scale: number): void
  {
    this.scale = scale;
  }

  protected override updateInitialTransforms()
  {
    super.updateInitialTransforms();

    this.applyRepeatFadeIn(this.circlePiece, this.hitObject.timeFadeIn);
    this.applyRepeatFadeIn(this.arrow, 150);
  }

  protected applyRepeatFadeIn(target: Drawable, fadeTime: number)
  {
    const slider = this.parentHitObject as DrawableSlider;

    const repeatIndex = this.hitObject.repeatIndex;

    console.assert(slider !== null);

    // When snaking in is enabled, the first end circle needs to be delayed until the snaking completes.
    const delayFadeIn = slider.sliderBody?.snakingIn.value == true && repeatIndex == 0;

    if (repeatIndex > 0)
      fadeTime = Math.min(slider.hitObject.spanDuration(), fadeTime);

    target
      .fadeOut()
      .delay(delayFadeIn ? (slider.hitObject.timePreempt) / 3 : 0)
      .fadeIn(fadeTime);
  }

  protected override onApplied()
  {
    super.onApplied();

    this.#hasRotation = false;
  }

  #hasRotation = false;

  protected override updateHitStateTransforms(state: ArmedState)
  {
    super.updateHitStateTransforms(state);

    const animDuration = Math.min(300, this.hitObject.spanDuration);

    // TODO: handle different states
    this.fadeOut(animDuration);
  }

  updateSnakingPosition(start: Vec2, end: Vec2)
  {
    if (this.time.current > this.hitObject.endTime)
      return;

    const isRepeatAtEnd = this.hitObject.repeatIndex % 2 === 0;
    const curve = (this.drawableSlider!.body.drawable as PlaySliderBody).currentCurve;

    this.position = isRepeatAtEnd ? end : start;

    if (curve.length < 2)
      return;

    const searchStart = isRepeatAtEnd ? curve.length - 1 : 0;
    const direction = isRepeatAtEnd ? -1 : 1;

    let aimRotationVector = Vec2.zero();

    // find the next vector2 in the curve which is not equal to our current position to infer a rotation.
    for (let i = searchStart; i >= 0 && i < curve.length; i += direction)
    {
      if (Vec2.almostEquals(curve[i], this.position))
        continue;

      aimRotationVector = curve[i];
      break;
    }

    let aimRotation = Math.atan2(aimRotationVector.y - this.y, aimRotationVector.x - this.x);
    while (Math.abs(aimRotation - this.arrow.rotation) > Math.PI)
      aimRotation += aimRotation < this.arrow.rotation ? Math.PI * 2 : Math.PI * -2;

    // The clock may be paused in a scenario like the editor.
    if (!this.#hasRotation || !this.clock!.isRunning)
    {
      this.arrow.rotation = aimRotation;
      this.#hasRotation = true;
    }
    else
    {
      // If we're already snaking, interpolate to smooth out sharp curves (linear sliders, mainly).
      this.arrow.rotation = Interpolation.valueAt(clamp(this.clock!.elapsedFrameTime, 0, 100), this.arrow.rotation, aimRotation, 0, 50, EasingFunction.OutQuint);
    }
  }
}

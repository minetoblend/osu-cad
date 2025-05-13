import { OsuSkinComponents } from "../../skinning/OsuSkinComponents";
import { DrawableHitCircle } from "./DrawableHitCircle";
import { DrawableSlider } from "./DrawableSlider";
import type { SliderHeadCircle } from "../SliderHeadCircle";
import { HitResult } from "@osucad/core";

export class DrawableSliderHead extends DrawableHitCircle
{
  constructor(initialHitObject?: SliderHeadCircle)
  {
    super(initialHitObject);
  }

  classicSliderBehavior = true;

  get drawableSlider(): DrawableSlider | null
  {
    if (this.parentHitObject instanceof DrawableSlider)
      return this.parentHitObject;
    return null;
  }

  protected override get componentLookup(): OsuSkinComponents
  {
    return OsuSkinComponents.SliderHeadHitCircle;
  }

  protected override updatePosition()
  {}

  protected override resultFor(timeOffset: number): HitResult
  {
    if (this.classicSliderBehavior)
    {
      return super.resultFor(timeOffset) ? HitResult.LargeTickHit : HitResult.LargeTickMiss;
    }

    return super.resultFor(timeOffset);
  }

  protected override checkForResult(userTriggered: boolean, timeOffset: number)
  {
    super.checkForResult(userTriggered, timeOffset);
    this.drawableSlider?.sliderInputManager.postProcessHeadJudgement(this);
  }

  override shake()
  {
    super.shake();
    this.drawableSlider?.shake();
  }
}

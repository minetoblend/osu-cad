import { DrawableOsuHitObject } from "./DrawableOsuHitObject";
import type { SliderTick } from "../SliderTick";

export class DrawableSliderTick extends DrawableOsuHitObject<SliderTick>
{
  public constructor(initialObject?: SliderTick)
  {
    super(initialObject);
  }

  protected override updatePosition(): void
  {

  }

  protected override updateScale(scale: number): void
  {
    this.scale = scale;
  }

  protected override checkForResult(userTriggered: boolean, timeOffset: number)
  {
    // this.drawableSlider?.sliderInputManager.tryJudgeNestedObject(this, timeOffset);
  }
}

import { DrawableOsuHitObject } from "./DrawableOsuHitObject";
import type { SliderTick } from "../SliderTick";
import { DrawableSlider } from "./DrawableSlider";
import { resolved } from "@osucad/framework";

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

  @resolved(() => DrawableSlider, true)
  accessor #drawableSlider!: DrawableSlider | undefined

  protected override checkForResult(userTriggered: boolean, timeOffset: number)
  {
    this.#drawableSlider?.sliderInputManager.tryJudgeNestedObject(this, timeOffset);
  }
}

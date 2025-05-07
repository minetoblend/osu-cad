import { OsuSkinComponents } from "../../skinning/OsuSkinComponents";
import { DrawableHitCircle } from "./DrawableHitCircle";
import { DrawableSlider } from "./DrawableSlider";
import type { SliderHeadCircle } from "../SliderHeadCircle";

export class DrawableSliderHead extends DrawableHitCircle
{
  constructor(initialHitObject?: SliderHeadCircle)
  {
    super(initialHitObject);
  }

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
}

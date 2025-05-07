import { DrawableHitObject } from "@osucad/core";
import { OsuSkinComponents } from "../../skinning/OsuSkinComponents";
import { DrawableHitCircle } from "./DrawableHitCircle";
import { DrawableSlider } from "./DrawableSlider";
import { resolved } from "@osucad/framework";

export class DrawableSliderHead extends DrawableHitCircle
{
  @resolved(DrawableHitObject, true)
  parentHitObject?: DrawableHitObject;

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

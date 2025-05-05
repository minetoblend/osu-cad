import { OsuSkinComponents } from "../../skinning/OsuSkinComponents";
import { DrawableHitCircle } from "./DrawableHitCircle";

export class DrawableSliderHead extends DrawableHitCircle 
{
  protected override get componentLookup(): OsuSkinComponents 
  {
    return OsuSkinComponents.SliderHead;
  }

  protected override updatePosition() 
  {
  }
}

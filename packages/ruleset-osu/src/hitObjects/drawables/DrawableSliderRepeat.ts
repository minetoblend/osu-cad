import type { ReadonlyDependencyContainer } from "@osucad/framework";
import { Anchor } from "@osucad/framework";
import { OsuHitObject } from "../OsuHitObject";
import { SkinnableDrawable } from "@osucad/core";
import { OsuSkinComponents } from "../../skinning";
import { DrawableOsuHitObject } from "./DrawableOsuHitObject";
import { DrawableSlider } from "./DrawableSlider";

export class DrawableSliderRepeat extends DrawableOsuHitObject
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

  protected override load(dependencies: ReadonlyDependencyContainer)
  {
    super.load(dependencies);

    this.origin = Anchor.Center;
    this.size = OsuHitObject.OBJECT_DIMENSIONS;

    this.addRangeInternal([
      new SkinnableDrawable(OsuSkinComponents.SliderTailHitCircle).with({
        anchor: Anchor.Center,
        origin: Anchor.Center,
      }),
      new SkinnableDrawable(OsuSkinComponents.ReverseArrow).with({
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
}

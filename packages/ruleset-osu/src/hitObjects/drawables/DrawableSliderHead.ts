import { SkinnableDrawable } from "@osucad/core";
import type { ReadonlyDependencyContainer } from "@osucad/framework";
import { Anchor, Axes } from "@osucad/framework";
import { OsuSkinComponents } from "../../skinning/OsuSkinComponents";
import { OsuHitObject } from "../OsuHitObject";
import { DrawableHitCircle } from "./DrawableHitCircle";

export class DrawableSliderHead extends DrawableHitCircle
{
  protected override load(dependencies: ReadonlyDependencyContainer)
  {
    super.load(dependencies);

    this.size = OsuHitObject.OBJECT_DIMENSIONS;

    this.internalChildren = [
      this.circlePiece = new SkinnableDrawable(OsuSkinComponents.SliderHead).with({
        relativeSizeAxes: Axes.Both,
        alpha: 0,
      }),
      this.approachCircle = new SkinnableDrawable(OsuSkinComponents.ApproachCircle).with({
        relativeSizeAxes: Axes.Both,
        anchor: Anchor.Center,
        origin: Anchor.Center,
        alpha: 0,
      }),
    ];
  }

  protected override get componentLookup(): OsuSkinComponents
  {
    return OsuSkinComponents.SliderHead;
  }

  protected override updatePosition()
  {
  }
}

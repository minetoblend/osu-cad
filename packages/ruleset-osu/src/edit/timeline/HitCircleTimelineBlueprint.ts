import { SkinnableDrawable } from "@osucad/core";
import { TimelineBlueprint } from "@osucad/editor";
import { Anchor, Axes, dependencyLoader, Vec2 } from "@osucad/framework";
import { OsuHitObject, type HitCircle } from "../../hitObjects";
import { OsuSkinComponents } from "../../skinning";
import { OsuTimelineBlueprint } from "./OsuTimelineBlueprint";

export class HitCircleTimelineBlueprint extends OsuTimelineBlueprint<HitCircle>
{
  @dependencyLoader()
  #load()
  {
    this.size = new Vec2(TimelineBlueprint.SIZE);
    this.origin = Anchor.Center;

    this.internalChildren = [
      new SkinnableDrawable(OsuSkinComponents.TimelineHitCircle).with({
        relativeSizeAxes: Axes.Both,
        anchor: Anchor.Center,
        origin: Anchor.Center,
        scale: new Vec2(TimelineBlueprint.SIZE).divInPlace(OsuHitObject.OBJECT_DIMENSIONS),
      }),
    ];
  }
}

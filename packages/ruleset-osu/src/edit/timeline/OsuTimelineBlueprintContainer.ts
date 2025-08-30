import type { HitObjectLifetimeEntry } from "@osucad/core";
import { TimelineBlueprint } from "@osucad/editor";
import { TimelineBlueprintContainer } from "@osucad/editor";
import { HitCircle, Slider } from "../../hitObjects";
import { HitCircleTimelineBlueprint } from "./HitCircleTimelineBlueprint";
import { SliderTimelineBlueprint } from "./SliderTimelineBlueprint";

export class OsuTimelineBlueprintContainer extends TimelineBlueprintContainer
{
  public constructor()
  {
    super();
  }

  protected override getDrawable(entry: HitObjectLifetimeEntry): TimelineBlueprint
  {
    if (entry.hitObject instanceof HitCircle)
      return new HitCircleTimelineBlueprint(entry);

    if (entry.hitObject instanceof Slider)
      return new SliderTimelineBlueprint(entry);

    return new TimelineBlueprint(entry);
  }
}

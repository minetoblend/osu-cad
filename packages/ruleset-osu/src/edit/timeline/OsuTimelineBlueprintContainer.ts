import type { TimelineLifetimeEntry } from "@osucad/editor";
import { TimelineBlueprint, TimelineBlueprintContainer } from "@osucad/editor";
import { HitCircle, Slider } from "../../hitObjects";
import { HitCircleTimelineBlueprint } from "./HitCircleTimelineBlueprint";
import { SliderTimelineBlueprint } from "./SliderTimelineBlueprint";

export class OsuTimelineBlueprintContainer extends TimelineBlueprintContainer
{
  public constructor()
  {
    super();
  }

  protected override getDrawable(entry: TimelineLifetimeEntry): TimelineBlueprint
  {
    if (entry.hitObject instanceof HitCircle)
      return new HitCircleTimelineBlueprint(entry);

    if (entry.hitObject instanceof Slider)
      return new SliderTimelineBlueprint(entry);

    return new TimelineBlueprint(entry);
  }
}

import type { TimelineLifetimeEntry } from "@osucad/editor";
import { TimelineBlueprint, TimelineBlueprintContainer } from "@osucad/editor";
import type { OsuHitObject } from "../../hitObjects";
import { HitCircle, Slider } from "../../hitObjects";
import { HitCircleTimelineBlueprint } from "./HitCircleTimelineBlueprint";
import { SliderTimelineBlueprint } from "./SliderTimelineBlueprint";
import { MultiDrawablePool } from "@osucad/core";
import { dependencyLoader } from "@osucad/framework";

export class OsuTimelineBlueprintContainer extends TimelineBlueprintContainer
{
  public constructor()
  {
    super();
  }

  #pool = new MultiDrawablePool<OsuHitObject, TimelineBlueprint>();

  @dependencyLoader()
  #load()
  {
    this.addInternal(this.#pool);

    this.#pool.registerPool(HitCircle, HitCircleTimelineBlueprint, 10, 40);
    this.#pool.registerPool(Slider, SliderTimelineBlueprint, 10, 40);
  }

  protected override getDrawable(entry: TimelineLifetimeEntry): TimelineBlueprint
  {
    const drawable = this.#pool.getPooledDrawableRepresentation(entry.hitObject as OsuHitObject);

    if (drawable)
    {
      drawable.entry = entry;
      return drawable;
    }

    return new TimelineBlueprint(entry);
  }
}

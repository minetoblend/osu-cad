import { SelectionBlueprintContainer } from "./SelectionBlueprintContainer";
import type { OsuHitObject } from "../../../hitObjects";
import { HitCircle, Slider } from "../../../hitObjects";
import type { HitObjectSelectionBlueprint } from "./HitObjectSelectionBlueprint";
import { HitCircleSelectionBlueprint } from "./HitCircleSelectionBlueprint";
import { OsuHitObjectLifetimeEntry } from "../../../hitObjects/drawables/OsuHitObjectLifetimeEntry";
import { SliderSelectionBlueprint } from "./SliderSelectionBlueprint";

export class OsuSelectionBlueprintContainer extends SelectionBlueprintContainer<OsuHitObject>
{
  protected override getBlueprintFor(hitObject: OsuHitObject): HitObjectSelectionBlueprint<OsuHitObject> | null
  {
    switch (hitObject.constructor)
    {
    case HitCircle:
      return new HitCircleSelectionBlueprint(hitObject as HitCircle);
    case Slider:
      return new SliderSelectionBlueprint(hitObject as Slider);
    }

    return null;
  }

  protected override createLifetimeEntry(hitObject: OsuHitObject)
  {
    return new OsuHitObjectLifetimeEntry(hitObject);
  }
}

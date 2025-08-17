import { SelectionBlueprintContainer } from "./SelectionBlueprintContainer";
import { HitCircle, type OsuHitObject } from "../../../hitObjects";
import type { HitObjectSelectionBlueprint } from "./HitObjectSelectionBlueprint";
import { HitCircleSelectionBlueprint } from "./HitCircleSelectionBlueprint";
import { OsuHitObjectLifetimeEntry } from "../../../hitObjects/drawables/OsuHitObjectLifetimeEntry";

export class OsuSelectionBlueprintContainer extends SelectionBlueprintContainer<OsuHitObject>
{
  protected override getBlueprintFor(hitObject: OsuHitObject): HitObjectSelectionBlueprint<OsuHitObject> | null
  {
    if (hitObject instanceof HitCircle)
      return new HitCircleSelectionBlueprint(hitObject);

    return null;
  }

  protected override createLifetimeEntry(hitObject: OsuHitObject)
  {
    return new OsuHitObjectLifetimeEntry(hitObject);
  }
}

import { SelectionBlueprintContainer } from "./SelectionBlueprintContainer";
import type { OsuHitObject } from "../../../hitObjects";
import { Slider } from "../../../hitObjects";
import { HitCircle } from "../../../hitObjects";
import type { HitObjectSelectionBlueprint } from "./HitObjectSelectionBlueprint";
import { OsuHitObjectLifetimeEntry } from "../../../hitObjects/drawables/OsuHitObjectLifetimeEntry";
import type { HitObject, HitObjectLifetimeEntry } from "@osucad/core";
import { MultiDrawablePool } from "@osucad/core";
import { dependencyLoader } from "@osucad/framework";
import { HitCircleSelectionBlueprint } from "./HitCircleSelectionBlueprint";
import { SliderSelectionBlueprint } from "./SliderSelectionBlueprint";

export class OsuSelectionBlueprintContainer extends SelectionBlueprintContainer<OsuHitObject>
{
  readonly #pool = new MultiDrawablePool<HitObject, HitObjectSelectionBlueprint<any> >();

  @dependencyLoader()
  #load()
  {
    this.addInternal(this.#pool);

    this.#pool.registerPool(HitCircle, HitCircleSelectionBlueprint, 10, 30);
    this.#pool.registerPool(Slider, SliderSelectionBlueprint, 10, 30);
  }

  protected override getBlueprintFor(entry: HitObjectLifetimeEntry): HitObjectSelectionBlueprint<OsuHitObject> | null
  {
    const drawable = this.#pool.getPooledDrawableRepresentation(entry.hitObject);

    if (drawable)
    {
      drawable.entry = entry;

      return drawable;
    }

    return null;
  }

  protected override createLifetimeEntry(hitObject: OsuHitObject)
  {
    return new OsuHitObjectLifetimeEntry(hitObject);
  }
}

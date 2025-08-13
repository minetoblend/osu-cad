import type { HitObject, HitObjectInivalidationType } from "@osucad/core";
import { EditorBeatmapProcessor } from "./EditorBeatmapProcessor";

export class DefaultsApplier extends EditorBeatmapProcessor
{
  constructor()
  {
    super(["applyDefaults"]);
  }

  #hitObjects = new Set<HitObject>();

  protected override onHitObjectInvalidated(
    hitObject: HitObject,
    invalidation: HitObjectInivalidationType,
  ): void
  {
    this.#hitObjects.add(hitObject);
  }

  protected override onHitObjectAdded(hitObject: HitObject): void
  {
    this.#hitObjects.add(hitObject);
  }

  protected override onHitObjectRemoved(hitObject: HitObject): void
  {
    this.#hitObjects.delete(hitObject);
  }

  protected override process(): void
  {
    for (const hitObject of this.#hitObjects)
      hitObject.applyDefaults(
          this.beatmap.difficulty,
          this.beatmap.controlPointInfo,
      );
  }
}

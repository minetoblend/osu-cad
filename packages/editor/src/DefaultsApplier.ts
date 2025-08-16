import type { HitObject, HitObjectInivalidationType } from "@osucad/core";
import { EditorBeatmapProcessor } from "./EditorBeatmapProcessor";
import type { EditorBeatmap } from "./runtime";

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
    hitObject.applyDefaults(this.beatmap.difficulty, this.beatmap.controlPointInfo);
  }

  protected override onHitObjectRemoved(hitObject: HitObject): void
  {
    this.#hitObjects.delete(hitObject);
  }

  protected override process(beatmap: EditorBeatmap): void
  {
    const { difficulty, controlPointInfo } = beatmap;

    for (const hitObject of this.#hitObjects)
      hitObject.applyDefaults(difficulty, controlPointInfo);
  }
}

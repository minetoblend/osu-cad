import type { HitObject, HitObjectInivalidationType } from "@osucad/core";
import { EditorBeatmapProcessor } from "./EditorBeatmapProcessor";
import type { EditorBeatmap } from "./runtime";

export class DefaultsApplier extends EditorBeatmapProcessor
{
  public constructor()
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

    hitObject.defaultsApplied.addListener(this.#defaultsApplied, this);
  }

  protected override onHitObjectRemoved(hitObject: HitObject): void
  {
    this.#hitObjects.delete(hitObject);

    hitObject.defaultsApplied.removeListener(this.#defaultsApplied, this);
  }

  #defaultsApplied(hitObject: HitObject)
  {
    this.#hitObjects.delete(hitObject);
  }

  protected override process(beatmap: EditorBeatmap): void
  {
    const { difficulty, controlPointInfo } = beatmap;

    for (const hitObject of [...this.#hitObjects].slice(0, 20))
    {
      hitObject.applyDefaults(difficulty, controlPointInfo);
      this.#hitObjects.delete(hitObject);
    }
  }
}

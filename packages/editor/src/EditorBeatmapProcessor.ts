import { Cached, Component, resolved } from "@osucad/framework";
import { EditorBeatmap } from "./runtime";
import type { HitObject, HitObjectInivalidationType } from "@osucad/core";

export abstract class EditorBeatmapProcessor extends Component
{
  protected constructor(
    protected readonly invalidations: HitObjectInivalidationType[],
  )
  {
    super();
  }

  protected abstract process(): void;

  @resolved(EditorBeatmap)
  protected accessor beatmap!: EditorBeatmap;

  protected override loadComplete(): void
  {
    super.loadComplete();

    for (const invalidation of this.invalidations)
    {
      const handler = (hitObject: HitObject) =>
        this.#onHitObjectInvalidated(hitObject, invalidation);

      this.beatmap.hitObjects.invalidated.addListener(invalidation, handler);
      this.onDispose(() =>
        this.beatmap.hitObjects.invalidated.removeListener(
            invalidation,
            handler,
        ),
      );
    }

    this.beatmap.hitObjects.added.addListener(this.onHitObjectAdded, this);
    this.beatmap.hitObjects.removed.addListener(this.onHitObjectRemoved, this);
  }

  #valid = false;

  #onHitObjectInvalidated(
    hitObject: HitObject,
    invalidation: HitObjectInivalidationType,
  )
  {
    this.onHitObjectInvalidated(hitObject, invalidation);
    this.refresh();
  }

  protected onHitObjectAdded(hitObject: HitObject)
  {}

  protected onHitObjectRemoved(hitObject: HitObject)
  {}

  protected onHitObjectInvalidated(
    hitObject: HitObject,
    invalidation: HitObjectInivalidationType,
  )
  {}

  refresh()
  {
    this.#valid = false;
  }

  override update(): void
  {
    super.update();

    if (!this.#valid)
    {
      this.process();
      this.#valid = true;
    }
  }

  override dispose(isDisposing?: boolean): void
  {
    this.beatmap.hitObjects.added.removeListener(this.onHitObjectAdded, this);
    this.beatmap.hitObjects.removed.removeListener(this.onHitObjectRemoved, this);

    super.dispose(isDisposing);
  }
}

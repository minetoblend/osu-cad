import type { DrawableHitObject, HitObject } from "@osucad/core";
import { Playfield } from "@osucad/core";
import type { Drawable } from "@osucad/framework";
import { Axes, CompositeDrawable, resolved } from "@osucad/framework";
import { HitCircle } from "../../../hitObjects";
import { HitCircleSelectionBlueprint } from "./HitCircleSelectionBlueprint";

export class SelectionBlueprintContainer extends CompositeDrawable
{
  constructor()
  {
    super();

    this.relativeSizeAxes = Axes.Both;

    this.childDied.addListener(drawable =>
    {
      const hitObject = (drawable as HitCircleSelectionBlueprint).hitObject;

      this.#blueprints.delete(hitObject);
    });
  }

  @resolved(Playfield)
  accessor #playfield!: Playfield;

  protected override loadComplete(): void
  {
    super.loadComplete();

    for (const drawable of this.#playfield.hitObjectContainer.aliveObjects)
      this.#addHitObject(drawable);

    this.#playfield.hitObjectContainer.drawableHitObjectBecameAlive.addListener(this.#addHitObject, this);
    this.#playfield.hitObjectUsageFinished.addListener(this.#removeHitObject, this);
  }

  #blueprints = new Map<HitObject, HitCircleSelectionBlueprint>();

  #addHitObject(drawable: DrawableHitObject)
  {
    const blueprint = this.getBlueprintFor(drawable.hitObject);

    if (!blueprint)
      return;

    blueprint.drawableHitObject = drawable;

    if (blueprint.isAlive)
      return;

    this.#blueprints.set(drawable.hitObject, blueprint);
    this.addInternal(blueprint);
  }

  #removeHitObject(hitObject: HitObject)
  {
    const blueprint = this.#blueprints.get(hitObject);

    if (!blueprint)
      return;

    blueprint.drawableHitObject = null;
  }

  getBlueprintFor(hitObject: HitObject)
  {
    if (this.#blueprints.has(hitObject))
      return this.#blueprints.get(hitObject)!;

    if (hitObject instanceof HitCircle)
      return new HitCircleSelectionBlueprint(hitObject);

    return null;
  }

  override dispose(isDisposing?: boolean): void
  {
    this.#playfield.hitObjectContainer.drawableHitObjectBecameAlive.removeListener(this.#addHitObject, this);
    this.#playfield.hitObjectUsageFinished.removeListener(this.#removeHitObject, this);

    super.dispose();
  }
}

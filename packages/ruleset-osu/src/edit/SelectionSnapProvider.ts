import type { Vec2 } from "@osucad/framework";
import { Component, resolved } from "@osucad/framework";
import type { ISnapOptions, ISnapProvider } from "./SnapProvider";
import { SnapResult } from "./SnapProvider";
import { Playfield } from "@osucad/core";
import type { DrawableOsuHitObject } from "../hitObjects/drawables/DrawableOsuHitObject";

export class HitObjectSnapProvider extends Component implements ISnapProvider
{
  public constructor()
  {
    super();
  }

  @resolved(Playfield)
  accessor #playfield!: Playfield;

  public* getSnapResults(targets: Vec2[], options?: ISnapOptions): Iterable<SnapResult>
  {
    const ignore = options?.ignore ?? [];

    for (const h of this.#playfield.hitObjectContainer.aliveObjects as DrawableOsuHitObject[])
    {
      if (ignore.includes(h.hitObject))
        continue;

      for (const p of h.hitObject.getSnapTargets())
      {
        for (const target of targets)
        {
          yield new SnapResult(target, p);
        }
      }
    }
  }
}

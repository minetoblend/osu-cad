import type { Vec2 } from "@osucad/framework";
import { Component, resolved } from "@osucad/framework";
import type { ISnapOptions, ISnapProvider } from "./SnapProvider";
import { SnapResult } from "./SnapProvider";
import { Playfield } from "@osucad/core";
import type { DrawableOsuHitObject } from "../hitObjects/drawables/DrawableOsuHitObject";
import { DrawableSlider } from "src/hitObjects/drawables/DrawableSlider";
import { DrawableSpinner } from "src/hitObjects/drawables/DrawableSpinner";
import type { HitObjectSelection } from "./tools/select/HitObjectSelection";
import type { OsuHitObject } from "src/hitObjects";

export class HitObjectSnapProvider extends Component implements ISnapProvider
{
  constructor()
  {
    super();
  }

  @resolved(Playfield)
  accessor #playfield!: Playfield;

  * getSnapResults(targets: Vec2[], options?: ISnapOptions): Iterable<SnapResult>
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

import { Anchor, Box, CompositeDrawable, resolved } from "@osucad/framework";
import type { SnapResultQuery } from "./SnapManager";
import { SnapManager } from "./SnapManager";
import { Playfield } from "@osucad/core";

export class SnapTargetVisualizer extends CompositeDrawable
{
  @resolved(SnapManager)
  accessor #snapManager!: SnapManager

  @resolved(Playfield)
  accessor #playfield!: Playfield

  public updateContent(query: SnapResultQuery)
  {
    this.clearInternal();

    for (const p of this.#snapManager.collectTargetFeatures(query))
    {
      this.addInternal(new Box({
        position: this.#playfield.toSpaceOfOtherDrawable(p, this),
        origin: Anchor.Center,
        size: 10,
        alpha: 0.8,
      }));
    }
  }

  public clear()
  {
    this.clearInternal();
  }
}

import { Vec2 } from "@osucad/framework";
import { Container, resolved } from "@osucad/framework";
import { SnapTargetMarker } from "./SnapTargetMarker";
import { Playfield } from "@osucad/core";

export class SnapTargetContainer extends Container<SnapTargetMarker>
{
  @resolved(Playfield)
  accessor #playfield!: Playfield

  public offset = Vec2.zero();

  protected override update(): void
  {
    super.update();

    const offset = this.offset;

    for (const marker of this.children)
      marker.position = this.#playfield.toSpaceOfOtherDrawable(marker.snapPosition.add(offset), this);
  }

  public addMarker(position: Vec2)
  {
    this.add(new SnapTargetMarker(position));
  }
}

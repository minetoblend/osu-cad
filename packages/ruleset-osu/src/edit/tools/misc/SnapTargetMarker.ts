import { EditorColors } from "@osucad/editor";
import type { Vec2 } from "@osucad/framework";
import { Anchor, Axes, Box, CircularContainer } from "@osucad/framework";

export class SnapTargetMarker extends CircularContainer
{
  public constructor(public readonly snapPosition: Vec2)
  {
    super({
      size: 18,
      origin: Anchor.Center,
      masking: true,
      borderThickness: 3,
      borderColor: EditorColors.green,
      child: new Box({
        relativeSizeAxes: Axes.Both,
        alpha: 0,
        alwaysPresent: true,
      }),
    });
  }
}

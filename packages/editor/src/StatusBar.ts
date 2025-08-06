import { Axes, Box, CompositeDrawable } from "@osucad/framework";

export class StatusBar extends CompositeDrawable
{
  static readonly HEIGHT = 24;

  constructor()
  {
    super();

    this.relativeSizeAxes = Axes.X;
    this.height = StatusBar.HEIGHT;

    this.internalChildren = [
      new Box({
        relativeSizeAxes: Axes.Both,
        color: 0x222228,
      }),
    ];
  }
}

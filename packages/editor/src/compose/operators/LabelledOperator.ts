import type { Drawable } from "@osucad/framework";
import { Anchor, Axes, CompositeDrawable, Dimension, GridContainer, GridSizeMode, SpriteText } from "@osucad/framework";

export class LabelledOperator extends CompositeDrawable
{
  public constructor(
    label: string,
    content: Drawable,
    labelWidth = 120,
  )
  {
    super();

    this.relativeSizeAxes = Axes.X;
    this.autoSizeAxes = Axes.Y;

    this.internalChild = new GridContainer({
      relativeSizeAxes: Axes.X,
      autoSizeAxes: Axes.Y,
      rowDimensions: [new Dimension(GridSizeMode.AutoSize)],
      columnDimensions:
      [
        new Dimension(GridSizeMode.Absolute, labelWidth),
        new Dimension(GridSizeMode.Absolute, 10),
        new Dimension(),
      ],
      content:
      [
        [
          new SpriteText({
            text: label,
            style: {
              fill: 0xffffff,
              fontSize: 14,
            },
            anchor: Anchor.CenterRight,
            origin: Anchor.CenterRight,
          }),
          undefined,
          content,
        ],
      ],
    });
  }
}

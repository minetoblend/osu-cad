import { Axes, CompositeDrawable, FillFlowContainer, Vec2 } from "@osucad/framework";
import { EditorToolbarButton } from "./ui/EditorToolbarButton";

export class ComposeToolbar extends CompositeDrawable
{
  static readonly WIDTH = 60;

  constructor()
  {
    super();

    this.relativeSizeAxes = Axes.Y;
    this.width = ComposeToolbar.WIDTH;

    this.margin = 10;

    this.addInternal(new FillFlowContainer({
      relativeSizeAxes: Axes.X,
      autoSizeAxes: Axes.Y,
      spacing: new Vec2(4),
      children: [
        new EditorToolbarButton(),
      ],
    }));
  }
}

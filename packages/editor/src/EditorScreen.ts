import { Axes, CompositeDrawable } from "@osucad/framework";

export abstract class EditorScreen extends CompositeDrawable
{
  protected constructor()
  {
    super();

    this.relativeSizeAxes = Axes.Both;
  }
}

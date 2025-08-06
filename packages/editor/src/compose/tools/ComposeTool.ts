import { Axes, CompositeDrawable, dependencyLoader } from "@osucad/framework";

export abstract class ComposeTool extends CompositeDrawable
{
  @dependencyLoader()
  #load()
  {
    this.relativeSizeAxes = Axes.Both;
  }
}

import { Axes, Container, FillFlowContainer, Vec2 } from "@osucad/framework";
import { ComposeToolButton } from "./ComposeToolButton";
import type { ComposeToolClass } from "./ComposeTool";

export class ComposeToolbar extends Container
{
  public static readonly WIDTH = 50;

  readonly #content!: FillFlowContainer;

  public override get content()
  {
    return this.#content;
  }

  public constructor()
  {
    super();

    this.relativeSizeAxes = Axes.Y;
    this.width = ComposeToolbar.WIDTH;

    this.addInternal(this.#content = new FillFlowContainer({
      relativeSizeAxes: Axes.X,
      autoSizeAxes: Axes.Y,
      spacing: new Vec2(4),
    }));
  }

  public addTool(tool: ComposeToolClass)
  {
    this.add(new ComposeToolButton(tool));
  }
}

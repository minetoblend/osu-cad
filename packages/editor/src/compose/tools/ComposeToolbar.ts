import { Axes, Container, FillFlowContainer, Vec2 } from "@osucad/framework";
import type { ComposeToolInfo } from "./ComposeToolInfo";
import { ComposeToolButton } from "./ComposeToolButton";
import type { ComposeTool } from "./ComposeTool";

export class ComposeToolbar extends Container
{
  static readonly WIDTH = 50;

  readonly #content!: FillFlowContainer;

  override get content()
  {
    return this.#content;
  }

  constructor()
  {
    super();

    this.relativeSizeAxes = Axes.Y;
    this.width = ComposeToolbar.WIDTH;

    this.margin = 10;

    this.addInternal(this.#content = new FillFlowContainer({
      relativeSizeAxes: Axes.X,
      autoSizeAxes: Axes.Y,
      spacing: new Vec2(4),
    }));
  }

  addTool(tool: ComposeToolInfo)
  {
    this.add(new ComposeToolButton(tool));
  }
}

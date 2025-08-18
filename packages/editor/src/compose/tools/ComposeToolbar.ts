import type { KeyDownEvent } from "@osucad/framework";
import { Axes, Container, FillFlowContainer, Vec2 } from "@osucad/framework";
import { ComposeToolButton } from "./ComposeToolButton";
import type { ComposeToolInfo } from "./ComposeToolInfo";

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

  override onKeyDown(e: KeyDownEvent): boolean
  {
    if (e.key.startsWith("Digit"))
    {
      const index = Number.parseInt(e.key.slice("Digit".length));
      if (Number.isFinite(index) && this.children[index - 1])
      {
        (this.children[index - 1] as ComposeToolButton).select();
        return true;
      }
    }

    return false;
  }
}

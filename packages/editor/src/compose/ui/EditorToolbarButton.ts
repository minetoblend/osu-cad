import { Axes, Box, Container, Vec2 } from "@osucad/framework";
import { ComposeToolbar } from "../ComposeToolbar";

export class EditorToolbarButton extends Container
{
  constructor()
  {
    super();

    this.size = new Vec2(ComposeToolbar.WIDTH);

    this.addInternal(this.#content = new Container({
      relativeSizeAxes: Axes.Both,
      masking: true,
      cornerRadius: 4,
      children: [
        new Box({
          relativeSizeAxes: Axes.Both,
          alpha: 0.8,
          color: 0x222228,
        }),
      ],
    }));
  }

  readonly #content: Container;

  override get content()
  {
    return this.#content;
  }
}

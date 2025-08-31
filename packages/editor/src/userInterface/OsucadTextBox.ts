import type { Drawable } from "@osucad/framework";
import { Axes, BasicTextBox, Box, Container } from "@osucad/framework";
import { Color } from "pixi.js";
import { EditorColors } from "../EditorColors";

export class OsucadTextBox extends BasicTextBox
{
  public constructor()
  {
    super();

    this.backgroundUnfocused = new Color(0x333339);
    this.backgroundFocused = new Color(0x555559);
  }

  protected override get selectionColor()
  {
    return new Color(EditorColors.primary);
  }

  protected override createBackground(): Drawable
  {
    return new Container({
      relativeSizeAxes: Axes.Both,
      masking: true,
      cornerRadius: 4,
      color: this.backgroundUnfocused,
      child: new Box({
        relativeSizeAxes: Axes.Both,
      }),
    });
  }
}

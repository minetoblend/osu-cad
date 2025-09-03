import { Anchor, Axes, Box, CompositeDrawable, SpriteText } from "@osucad/framework";

export class ComposerStatusBar extends CompositeDrawable
{
  readonly #text!: SpriteText;

  public constructor()
  {
    super();

    this.relativeSizeAxes = Axes.X;
    this.height = 26;

    this.internalChildren = [
      new Box({
        color: 0x222228,
        alpha: 0.5,
        relativeSizeAxes: Axes.Both,
      }),
      this.#text = new SpriteText({
        anchor: Anchor.CenterLeft,
        origin: Anchor.CenterLeft,
        margin: { horizontal: 10 },
        alpha: 0.6,
        style: {
          fill: 0xffffff,
          fontSize: 16,
          fontFamily: "monospace",
        },
      }),
    ];
  }

  public get text()
  {
    return this.#text.text;
  }

  public set text(value)
  {
    this.#text.text = value;
  }
}

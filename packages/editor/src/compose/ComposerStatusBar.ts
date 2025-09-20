import { Anchor, Axes, Box, CompositeDrawable, dependencyLoader, SpriteText } from "@osucad/framework";
import { ColorProvider } from "../ColorProvider";

export class ComposerStatusBar extends CompositeDrawable
{
  readonly #text!: SpriteText;

  public constructor()
  {
    super();

    this.relativeSizeAxes = Axes.X;
    this.height = 26;

    this.addInternal(this.#text = new SpriteText({
      anchor: Anchor.CenterLeft,
      origin: Anchor.CenterLeft,
      margin: { horizontal: 10 },
      alpha: 0.6,
      style: {
        fill: 0xffffff,
        fontSize: 16,
        fontFamily: "monospace",
      },
    }));
  }

  @dependencyLoader()
  #load()
  {
    const colorProvider = this.dependencies.resolve(ColorProvider);

    this.addInternal(new Box({
      relativeSizeAxes: Axes.Both,
      color: colorProvider.background5,
      alpha: 0.5,
      depth: 1,
    }));
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

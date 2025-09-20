import type { Drawable } from "@osucad/framework";
import { Axes, Box, Container, dependencyLoader } from "@osucad/framework";
import { ColorProvider } from "./ColorProvider";

export class StatusBar extends Container
{
  public static readonly HEIGHT = 26;

  readonly #content = new Container({
    relativeSizeAxes: Axes.Both,
  });

  protected override get content(): Container<Drawable>
  {
    return this.#content;
  }

  @dependencyLoader()
  #load()
  {
    const colorProvider = this.dependencies.resolve(ColorProvider);

    this.relativeSizeAxes = Axes.X;
    this.height = StatusBar.HEIGHT;

    this.internalChildren = [
      new Box({
        relativeSizeAxes: Axes.Both,
        color: colorProvider.background4,
      }),
      this.#content,
    ];
  }
}

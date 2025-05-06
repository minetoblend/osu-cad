import type { ReadonlyDependencyContainer } from "@osucad/framework";
import { Axes, Container, Game } from "@osucad/framework";

export class StorybookGame extends Game
{
  constructor()
  {
    super();
  }

  readonly storyContainer = new Container({
    relativeSizeAxes: Axes.Both,
  });

  protected override load(dependencies: ReadonlyDependencyContainer)
  {
    super.load(dependencies);

    this.add(this.storyContainer);
  }
}

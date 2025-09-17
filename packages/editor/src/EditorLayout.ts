import { Axes, CompositeDrawable, dependencyLoader, Dimension, GridContainer, GridSizeMode, provide } from "@osucad/framework";
import { EditorBottomBar } from "./bottomBar/EditorBottomBar";
import { ComposeScreen } from "./compose";
import { StatusBar } from "./StatusBar";

export class EditorLayout extends CompositeDrawable
{
  @provide(StatusBar)
  readonly #statusBar = new StatusBar();

  @dependencyLoader()
  #load()
  {
    this.relativeSizeAxes = Axes.Both;

    this.internalChildren = [
      new GridContainer({
        relativeSizeAxes: Axes.Both,
        rowDimensions: [new Dimension(), new Dimension(GridSizeMode.AutoSize), new Dimension(GridSizeMode.AutoSize)],
        columnDimensions: [new Dimension()],
        content: [
          [new ComposeScreen()],
          [new EditorBottomBar()],
          [this.#statusBar],
        ],
      }),
    ];
  }
}

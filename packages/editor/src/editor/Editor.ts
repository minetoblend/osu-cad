import { Axes, Container, dependencyLoader } from "osucad-framework";
import { EditorBottomBar } from "./EditorBottomBar";
import { EditorTopBar } from "./EditorTopBar";
import { EditorScreenContainer } from "./EditorScreenContainer";
import { ThemeColors } from "./ThemeColors";
import { EditorClock } from "./EditorClock";

export class Editor extends Container {
  constructor() {
    super({
      relativeSizeAxes: Axes.Both,
    });
  }

  #screenContainer!: EditorScreenContainer;
  #topBar!: EditorTopBar;
  #bottomBar!: EditorBottomBar;

  @dependencyLoader()
  init() {
    this.dependencies.provide(new ThemeColors())
    this.dependencies.provide(new EditorClock())

    this.addAll(
      new Container({
        relativeSizeAxes: Axes.Both,
        padding: { top: 84, bottom: 48 },
        child: (this.#screenContainer = new EditorScreenContainer()),
      }),
      (this.#topBar = new EditorTopBar()),
      (this.#bottomBar = new EditorBottomBar())
    );
  }
}

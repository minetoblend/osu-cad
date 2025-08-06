import { PlayfieldClock } from "@osucad/core";
import type { Beatmap } from "@osucad/core";
import { nn, Ruleset } from "@osucad/core";
import type { ReadonlyDependencyContainer } from "@osucad/framework";
import { Anchor, Axes, Container, provide, Screen } from "@osucad/framework";
import { ComposeScreen } from "./compose/ComposeScreen";
import { EditorClock } from "./EditorClock";
import { EditorBeatmap } from "./EditorBeatmap";
import { StatusBar } from "./StatusBar";

export interface EditorOptions
{
  readonly beatmap: Beatmap;
}

export class Editor extends Screen
{
  constructor(options: EditorOptions)
  {
    super();

    const { beatmap } = options;

    this.ruleset = nn(beatmap.beatmapInfo.ruleset, "Beatmap has no known ruleset");

    this.editorClock = new EditorClock(true);

    this.editorBeatmap = new EditorBeatmap(beatmap);
  }

  @provide(EditorBeatmap)
  readonly editorBeatmap: EditorBeatmap;

  @provide(Ruleset)
  readonly ruleset: Ruleset;

  @provide(EditorClock)
  @provide(PlayfieldClock)
  editorClock: EditorClock;

  @provide()
  readonly #statusBar = new StatusBar();

  protected override load(dependencies: ReadonlyDependencyContainer)
  {
    super.load(dependencies);

    this.addRangeInternal([
      new Container({
        relativeSizeAxes: Axes.Both,
        padding: { bottom: StatusBar.HEIGHT },
        child: new ComposeScreen(),
      }),
      this.#statusBar.with({
        anchor: Anchor.BottomLeft,
        origin: Anchor.BottomLeft,
      }),
    ]);
  }

  override update()
  {
    super.update();

    this.editorClock.processFrame();
  }
}

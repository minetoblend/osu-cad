import type { ScrollEvent } from "@osucad/framework";
import { asyncDependencyLoader, lerp, provide, resolved, Screen } from "@osucad/framework";
import { EditorBeatmap, EditorRuntime } from "./runtime";
import type { Skin } from "@osucad/core";
import { ISkinSource, PlayfieldClock, Ruleset, SkinProvidingContainer } from "@osucad/core";
import { EditorRuleset } from "./EditorRuleset";
import { EditorClock } from "./EditorClock";
import { ComposeScreen } from "./compose";
import { BindableBeatDivisor } from "./BindableBeatDivisor";

export interface EditorOptions
{
  readonly runtime: EditorRuntime
}

export class Editor extends Screen
{
  constructor(options: EditorOptions)
  {
    super();

    this.runtime = options.runtime;
  }

  @provide(EditorRuntime)
  readonly runtime: EditorRuntime;

  @provide(EditorBeatmap)
  get editorBeatmap()
  {
    return this.runtime.root;
  }

  @provide(Ruleset)
  get ruleset()
  {
    return this.runtime.ruleset;
  }

  @provide(EditorRuleset)
  get editorRuleset()
  {
    return this.runtime.editorRuleset;
  }

  @resolved(ISkinSource)
  accessor #skinSource!: ISkinSource

  @provide(PlayfieldClock)
  @provide(EditorClock)
  readonly editorClock = new EditorClock(false);

  @provide(BindableBeatDivisor)
  readonly beatDivisor = new BindableBeatDivisor(4);

  @asyncDependencyLoader()
  async #load()
  {
    this.editorRuleset.setupEditor(this);

    // TODO: fix whatever the fuck this is
    const skin = (this.#skinSource as any).skin as Skin;

    const skinTransformer = await this.ruleset.createSkinTransformer?.(skin);

    this.addInternal(new SkinProvidingContainer({
      skin: skinTransformer ?? skin,
      children: [
        new ComposeScreen(),
      ],
    }));
  }

  override update()
  {
    super.update();

    this.editorClock.processFrame();
  }

  override onScroll(e: ScrollEvent): boolean
  {
    if (e.controlPressed || e.shiftPressed || e.altPressed)
      return false;

    this.editorClock.seek(this.editorClock.currentTime - e.scrollDelta.y * 100);

    return true;
  }
}

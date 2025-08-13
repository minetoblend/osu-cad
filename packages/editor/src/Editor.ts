import type { ScrollEvent } from "@osucad/framework";
import { asyncDependencyLoader, FramedClock, lerp, ManualClock, provide, resolved, Screen } from "@osucad/framework";
import { EditorRuntime } from "./runtime";
import { EditorBeatmap } from "./EditorBeatmap";
import type { Skin } from "@osucad/core";
import { BeatmapDifficultyInfo, ISkinSource, LegacyBeatmapTiming, LegacyTimingPoint, PlayfieldClock, Ruleset, SkinProvidingContainer } from "@osucad/core";
import { EditorRuleset } from "./EditorRuleset";
import { EditorClock } from "./EditorClock";

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
  readonly editorClock = new EditorClock(false);


  @asyncDependencyLoader()
  async #load()
  {
    // TODO: fix whatever the fuck this is
    const skin = (this.#skinSource as any).skin as Skin;

    const skinTransformer = await this.ruleset.createSkinTransformer?.(skin);

    const drawableRuleset = await this.ruleset.createDrawableRuleset({ cursor: false, useInput: false });

    this.addInternal(new SkinProvidingContainer({
      skin: skinTransformer ?? skin,
      children: [
        drawableRuleset,
      ],
    }));

    for (const hitObject of this.editorBeatmap.hitObjects)
    {
      hitObject.applyDefaults(this.editorBeatmap.difficulty, this.editorBeatmap.controlPointInfo);
      drawableRuleset.addHitObject(hitObject);
    }
  }

  override update()
  {
    super.update();

    this.editorClock.seek(lerp(this.targetTime, this.editorClock.currentTime, Math.exp(-0.03 * this.time.elapsed)));

    this.editorClock.processFrame();
  }

  targetTime = 0;

  override onScroll(e: ScrollEvent): boolean
  {
    this.targetTime -= e.scrollDelta.y * 100;

    return true;
  }
}

import type { DDSAttributes, IDecoder } from "@osucad/multiplayer-core";
import { nested, nn, ObjectDDS, Signaler } from "@osucad/multiplayer-core";
import { EditorRuntime } from "../EditorRuntime";
import { BeatmapDifficultyInfo, BeatmapInfo, BeatmapMetadata, ControlPointInfo, type Ruleset } from "@osucad/core";
import type { EditorRuleset } from "../../EditorRuleset";
import { HitObjectCollection } from "./HitObjectCollection";

export class EditorBeatmap extends ObjectDDS
{
  static readonly attributes: DDSAttributes = {
    type: "@osucad/editor-beatmap",
    version: 0,
  };

  ruleset!: Ruleset;
  editorRuleset!: EditorRuleset;

  constructor()
  {
    super(EditorBeatmap.attributes);
  }

  @nested(HitObjectCollection)
  accessor #hitObjects = new HitObjectCollection()

  get hitObjects()
  {
    return this.#hitObjects;
  }

  @nested(BeatmapDifficultyInfo)
  accessor difficulty = new BeatmapDifficultyInfo()

  @nested(ControlPointInfo)
  accessor controlPointInfo = new ControlPointInfo()

  @nested(BeatmapMetadata)
  accessor metadata = new BeatmapMetadata()

  @nested(BeatmapInfo)
  accessor beatmapInfo = new BeatmapInfo()

  @nested(Signaler)
  accessor signals = new Signaler()

  override load(summary: unknown, version: number, decoder: IDecoder)
  {
    const runtime = nn(this.runtime);
    if (!(runtime instanceof EditorRuntime))
      throw new Error("EditorBeatmap must be used with EditorRuntime");

    this.ruleset = nn(runtime.ruleset);
    this.editorRuleset = nn(runtime.editorRuleset);

    super.load(summary, version, decoder);
  }
}

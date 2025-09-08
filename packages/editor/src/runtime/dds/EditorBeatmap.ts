import type { Beatmap } from "@osucad/core";
import { BeatmapDifficultyInfo, BeatmapInfo, BeatmapMetadata, ControlPointInfo, type Ruleset } from "@osucad/core";
import type { DDSAttributes, IDecoder } from "@osucad/multiplayer-core";
import { nested, nn, ObjectDDS, Signaler } from "@osucad/multiplayer-core";
import type { EditorRuleset } from "../../EditorRuleset";
import { EditorRuntime } from "../EditorRuntime";
import { HitObjectCollection } from "./HitObjectCollection";
import { RemoteFileSystem } from "./RemoteFileSystem";

export class EditorBeatmap extends ObjectDDS
{
  public static readonly attributes: DDSAttributes = {
    type: "@osucad/editor-beatmap",
    version: 0,
  };

  public ruleset!: Ruleset;
  public editorRuleset!: EditorRuleset;

  public constructor()
  {
    super(EditorBeatmap.attributes);
  }

  @nested(HitObjectCollection)
  accessor #hitObjects = new HitObjectCollection()

  public get hitObjects()
  {
    return this.#hitObjects;
  }

  @nested(BeatmapDifficultyInfo)
  public accessor difficulty = new BeatmapDifficultyInfo()

  @nested(ControlPointInfo)
  public accessor controlPointInfo = new ControlPointInfo()

  @nested(BeatmapMetadata)
  public accessor metadata = new BeatmapMetadata()

  @nested(BeatmapInfo)
  public accessor beatmapInfo = new BeatmapInfo()

  @nested(RemoteFileSystem)
  public accessor fileSystem = new RemoteFileSystem()

  @nested(Signaler)
  public accessor signals = new Signaler()

  public override load(summary: unknown, version: number, decoder: IDecoder)
  {
    const runtime = nn(this.runtime);
    if (!(runtime instanceof EditorRuntime))
      throw new Error("EditorBeatmap must be used with EditorRuntime");

    this.ruleset = nn(runtime.ruleset);
    this.editorRuleset = nn(runtime.editorRuleset);

    super.load(summary, version, decoder);
  }
}

export namespace EditorBeatmap
{
  export async function fromBeatmap(beatmap: Beatmap)
  {
    if (!beatmap.ruleset)
      throw new Error("Beatmap has no ruleset");

    const editorBeatmap = new EditorBeatmap();

    editorBeatmap.ruleset = beatmap.ruleset;
    editorBeatmap.editorRuleset = nn(await beatmap.ruleset.createEditorRuleset?.(), "Ruleset does not provide an editor ruleset");

    editorBeatmap.controlPointInfo = beatmap.controlPointInfo;
    editorBeatmap.difficulty = beatmap.difficulty;
    editorBeatmap.metadata = beatmap.metadata;
    editorBeatmap.beatmapInfo = beatmap.beatmapInfo;

    for (const hitObject of beatmap.hitObjects)
      editorBeatmap.hitObjects.add(hitObject);

    return editorBeatmap;
  }
}

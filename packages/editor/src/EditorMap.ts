import type { DDSAttributes, IDecoder } from "@osucad/multiplayer-core";
import { nested, nn, ObjectDDS } from "@osucad/multiplayer-core";
import { EditorRuntime } from "./runtime/EditorRuntime";
import type { Ruleset } from "@osucad/core";
import type { EditorRuleset } from "./EditorRuleset";
import { HitObjectCollection } from "./runtime/HitObjectCollection";

// TODO: replace EditorBeatmap.ts with this

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
  accessor hitObjects = new HitObjectCollection()

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

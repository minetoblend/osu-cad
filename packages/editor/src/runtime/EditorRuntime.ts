import { BeatmapDifficultyInfo, BeatmapInfo, BeatmapMetadata, ControlPointInfo, nn, type Ruleset, rulesets, type RulesetStore, SampleControlPoint, TimingControlPoint } from "@osucad/core";
import type { DDS, DDSFactoryOrConstructor, IDocumentSummary } from "@osucad/multiplayer-core";
import { DocumentRuntime, Encoder, Signaler } from "@osucad/multiplayer-core";
import type { EditorRuleset } from "../EditorRuleset";
import { EditorHistory } from "./EditorHistory";
import { EditorBeatmap } from "./dds/EditorBeatmap";
import { HitObjectCollection } from "./dds/HitObjectCollection";

export interface IEditorDocumentSummary extends IDocumentSummary
{
  rulesetId: string
}

export interface EditorRuntimeConfig
{
  readonly types: readonly DDSFactoryOrConstructor<DDS>[]
}

export class EditorRuntime extends DocumentRuntime<EditorBeatmap>
{
  constructor(readonly rulesetStore: RulesetStore = rulesets)
  {
    super([
      Signaler,
      EditorBeatmap,
      HitObjectCollection,
      BeatmapDifficultyInfo,
      BeatmapMetadata,
      ControlPointInfo,
      TimingControlPoint,
      SampleControlPoint,
      BeatmapInfo,
    ]);

    this.history = new EditorHistory(this);
  }

  readonly history: EditorHistory;

  ruleset!: Ruleset;
  editorRuleset!: EditorRuleset;

  override createSummary(): IEditorDocumentSummary
  {
    const summary = super.createSummary();

    return {
      rulesetId: this.ruleset.id,
      ...summary,
    };
  }

  static async createEmpty(ruleset: Ruleset)
  {
    const runtime = new EditorRuntime();

    const editorRuleset = nn(await ruleset.createEditorRuleset?.());

    runtime.ruleset = ruleset;
    runtime.editorRuleset = editorRuleset;

    for (const type of editorRuleset.runtimeConfig.types)
      runtime.typeRegistry.register(type);

    const root = new EditorBeatmap();
    runtime.objects.root = root;
    runtime.objects.attach(root);

    return runtime;
  }

  override async load(summary: IDocumentSummary)
  {
    if (!("rulesetId" in summary) || typeof summary.rulesetId !== "string")
      throw new Error("Invalid document summary");

    this.ruleset = nn(this.rulesetStore.get({ id: summary.rulesetId }), `Ruleset "${summary.rulesetId}" is not supported`);
    this.editorRuleset = nn(await this.ruleset.createEditorRuleset?.(), `Ruleset "${summary.rulesetId}" is not supported`);

    const config = this.editorRuleset.runtimeConfig;

    for (const type of config.types)
      this.typeRegistry.register(type);

    await super.load(summary);
  }

  override dispose()
  {
    this.history.dispose();
    (this.history as unknown) = null;

    super.dispose();
  }
}

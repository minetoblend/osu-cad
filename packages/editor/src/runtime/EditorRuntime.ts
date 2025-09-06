import type { Beatmap } from "@osucad/core";
import { BeatmapDifficultyInfo, BeatmapInfo, BeatmapMetadata, ControlPointInfo, nn, type Ruleset, rulesets, type RulesetStore, SampleControlPoint, TimingControlPoint } from "@osucad/core";
import type { DDS, DDSFactoryOrConstructor, IDocumentSummary } from "@osucad/multiplayer-core";
import { DocumentRuntime, Signaler } from "@osucad/multiplayer-core";
import type { EditorRuleset } from "../EditorRuleset";
import { EditorHistory } from "./EditorHistory";
import { EditorBeatmap, HitObjectCollection } from "./dds";

export interface EditorRuntimeConfig
{
  readonly types: readonly DDSFactoryOrConstructor<DDS>[]
}

export class EditorRuntime extends DocumentRuntime<EditorBeatmap>
{
  public constructor(public readonly rulesetStore: RulesetStore = rulesets)
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

  public readonly history: EditorHistory;

  public ruleset!: Ruleset;
  public editorRuleset!: EditorRuleset;

  public override createSummary(): IDocumentSummary
  {
    const summary = super.createSummary();

    return {
      ...summary,
      attributes: {
        ...summary.attributes,
        rulesetId: this.ruleset.id,
      },
    };
  }

  public static async createEmpty(ruleset: Ruleset)
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

  public static async createEmptyFromBeatmap(beatmap: Beatmap)
  {
    const runtime = new EditorRuntime();

    const root = await EditorBeatmap.fromBeatmap(beatmap);

    runtime.ruleset = root.ruleset;
    runtime.editorRuleset = root.editorRuleset;

    for (const type of root.editorRuleset.runtimeConfig.types)
      runtime.typeRegistry.register(type);

    runtime.objects.root = root;
    runtime.objects.attach(root);

    return runtime;
  }

  public override async load(summary: IDocumentSummary)
  {
    if (!("rulesetId" in summary.attributes) || typeof summary.attributes.rulesetId !== "string")
      throw new Error("Invalid document summary");

    this.ruleset = nn(this.rulesetStore.get({ id: summary.attributes.rulesetId }), `Ruleset "${summary.attributes.rulesetId}" is not supported`);
    this.editorRuleset = nn(await this.ruleset.createEditorRuleset?.(), `Ruleset "${summary.attributes.rulesetId}" is not supported`);

    const config = this.editorRuleset.runtimeConfig;

    for (const type of config.types)
      this.typeRegistry.register(type);

    await super.load(summary);
  }

  public override dispose()
  {
    this.history.dispose();
    (this.history as unknown) = null;

    super.dispose();
  }
}

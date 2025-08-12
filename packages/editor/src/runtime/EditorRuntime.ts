import { nn, type Ruleset, type RulesetStore, rulesets } from "@osucad/core";
import type { DDS, DDSFactoryOrConstructor, IDocumentSummary } from "@osucad/multiplayer-core";
import { DocumentHistory } from "@osucad/multiplayer-core";
import { DocumentRuntime } from "@osucad/multiplayer-core";
import type { EditorRuleset } from "../EditorRuleset";
import { EditorBeatmap } from "../EditorMap";
import { HitObjectCollection } from "./HitObjectCollection";

export interface IEditorDocumentSummary extends IDocumentSummary
{
  rulesetId: string
}

export interface EditorRuntimeConfig
{
  readonly types: readonly DDSFactoryOrConstructor<DDS>[]
}

export class EditorRuntime extends DocumentRuntime
{
  constructor(readonly rulesetStore: RulesetStore = rulesets)
  {
    super([EditorBeatmap, HitObjectCollection]);

    this.history = new DocumentHistory(this);
  }

  readonly history: DocumentHistory;

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

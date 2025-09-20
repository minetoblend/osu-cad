import type { Ruleset } from "@osucad/core";
import type { HitObjectComposer } from "./compose/HitObjectComposer";
import type { EditorRuntimeConfig } from "./runtime/EditorRuntime";
import type { Editor } from "./Editor";
import type { Component, KeyBinding } from "@osucad/framework";
import type { TimelineBlueprintContainer } from "./compose/timeline";
import type { ComposeToolClass } from "./compose";

export abstract class EditorRuleset
{
  public abstract readonly ruleset: Ruleset;

  public abstract readonly runtimeConfig: EditorRuntimeConfig;

  public abstract createHitObjectComposer(): HitObjectComposer;

  public abstract getHitObjectTools(): readonly ComposeToolClass[];

  public setupEditor(editor: Editor)
  {
  }

  public createBackgroundProcessors(): Component[]
  {
    return [];
  }

  public createTimelineBlueprintContainer(): TimelineBlueprintContainer | null
  {
    return null;
  }

  public getDefaultKeyBindings(): KeyBinding[]
  {
    return [];
  }
}

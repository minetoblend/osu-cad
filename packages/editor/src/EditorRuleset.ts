import type { Awaitable } from "@osucad/core";
import type { HitObjectComposer } from "./compose/HitObjectComposer";
import type { EditorRuntimeConfig } from "./runtime/EditorRuntime";
import type { Editor } from "./Editor";
import type { Component } from "@osucad/framework";

export abstract class EditorRuleset
{
  public abstract readonly runtimeConfig: EditorRuntimeConfig;

  public abstract createHitObjectComposer(): Awaitable<HitObjectComposer>;

  public setupEditor(editor: Editor)
  {
  }

  public createBackgroundProcessors(): Component[]
  {
    return [];
  }
}

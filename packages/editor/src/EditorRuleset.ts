import type { Awaitable } from "@osucad/core";
import type { HitObjectComposer } from "./compose/HitObjectComposer";
import type { EditorRuntimeConfig } from "./runtime/EditorRuntime";
import type { Editor } from "./Editor";

export abstract class EditorRuleset
{
  abstract readonly runtimeConfig: EditorRuntimeConfig;

  abstract createHitObjectComposer(): Awaitable<HitObjectComposer>;

  setupEditor(editor: Editor)
  {
  }
}

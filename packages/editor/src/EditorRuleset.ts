import type { HitObjectComposer } from "./compose/HitObjectComposer";
import type { EditorRuntimeConfig } from "./runtime/EditorRuntime";

export interface EditorRuleset
{
  runtimeConfig: EditorRuntimeConfig

  createHitObjectComposer(): HitObjectComposer
}

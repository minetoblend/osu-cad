import type { Awaitable } from "@osucad/core";
import type { HitObjectComposer } from "./compose/HitObjectComposer";
import type { EditorRuntimeConfig } from "./runtime/EditorRuntime";
import { injectionToken } from "@osucad/framework";

export interface EditorRuleset
{
  runtimeConfig: EditorRuntimeConfig

  createHitObjectComposer(): Awaitable<HitObjectComposer>
}

export const EditorRuleset = injectionToken<EditorRuleset>("EditorRuleset");

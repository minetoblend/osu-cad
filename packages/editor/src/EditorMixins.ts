import type { Awaitable } from "@osucad/core";
import type { HitObjectComposer } from "./compose/HitObjectComposer";
import type { EditorRuleset } from "./EditorRuleset";

export {};

declare global
{
  namespace OsucadMixins
  {
    interface Ruleset
    {
      createHitObjectComposer?(): Awaitable<HitObjectComposer>;
      createEditorRuleset?(): Awaitable<EditorRuleset>
    }
  }
}

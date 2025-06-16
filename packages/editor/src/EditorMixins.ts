import type { Awaitable } from "@osucad/core";
import type { HitObjectComposer } from "./compose/HitObjectComposer";

export {};

declare global
{
  namespace OsucadMixins
  {
    interface Ruleset
    {
      createHitObjectComposer?(): Awaitable<HitObjectComposer>;
    }
  }
}

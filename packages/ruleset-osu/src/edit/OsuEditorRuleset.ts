import type { EditorRuleset, EditorRuntimeConfig, HitObjectComposer } from "@osucad/editor";
import { HitCircle } from "../hitObjects/HitCircle";
import { Slider } from "../hitObjects/Slider";
import { Spinner } from "../hitObjects/Spinner";
import { OsuHitObjectComposer } from "./OsuHitObjectComposer";

export class OsuEditorRuleset implements EditorRuleset
{
  readonly runtimeConfig: EditorRuntimeConfig = {
    types: [
      HitCircle,
      Slider,
      Spinner,
    ],
  };

  createHitObjectComposer(): HitObjectComposer
  {
    return new OsuHitObjectComposer();
  }
}

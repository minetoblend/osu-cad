import type { EditorRuleset, EditorRuntimeConfig, HitObjectComposer } from "@osucad/editor";
import { HitCircle } from "../hitObjects/HitCircle";
import { Slider } from "../hitObjects/Slider";
import { SliderPath } from "../hitObjects/SliderPath";
import { Spinner } from "../hitObjects/Spinner";
import { OsuHitObjectComposer } from "./OsuHitObjectComposer";

export class OsuEditorRuleset implements EditorRuleset
{
  readonly runtimeConfig: EditorRuntimeConfig = {
    types: [
      HitCircle,
      Slider,
      Spinner,
      SliderPath,
    ],
  };

  createHitObjectComposer(): HitObjectComposer
  {
    return new OsuHitObjectComposer();
  }
}

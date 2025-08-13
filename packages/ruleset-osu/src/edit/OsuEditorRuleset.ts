import type { Editor, EditorRuntimeConfig, HitObjectComposer } from "@osucad/editor";
import { EditorRuleset } from "@osucad/editor";
import { HitCircle } from "../hitObjects/HitCircle";
import { Slider } from "../hitObjects/Slider";
import { SliderPath } from "../hitObjects/SliderPath";
import { Spinner } from "../hitObjects/Spinner";

export class OsuEditorRuleset extends EditorRuleset
{
  readonly runtimeConfig: EditorRuntimeConfig = {
    types: [
      HitCircle,
      Slider,
      Spinner,
      SliderPath,
    ],
  };

  override async createHitObjectComposer(): Promise<HitObjectComposer>
  {
    return import("./OsuHitObjectComposer").then(m => new m.OsuHitObjectComposer());
  }

  override setupEditor(editor: Editor)
  {
  }
}

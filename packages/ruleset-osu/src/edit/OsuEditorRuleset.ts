import type { EditorRuntimeConfig, HitObjectComposer } from "@osucad/editor";
import { EditorRuleset } from "@osucad/editor";
import { HitCircle } from "../hitObjects/HitCircle";
import { Slider } from "../hitObjects/Slider";
import { SliderPath } from "../hitObjects/SliderPath";
import { Spinner } from "../hitObjects/Spinner";
import type { Component } from "@osucad/framework";
import { EditorStackingProcessor } from "./EditorStackingProcessor";
import { EditorComboProcessor } from "./EditorComboProcessor";

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

  public override createBackgroundProcessors(): Component[]
  {
    return [
      new EditorComboProcessor(),
      new EditorStackingProcessor(),
    ];
  }
}

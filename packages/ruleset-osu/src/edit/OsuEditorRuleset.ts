import type { EditorRuntimeConfig, HitObjectComposer, TimelineBlueprintContainer } from "@osucad/editor";
import { EditorRuleset } from "@osucad/editor";
import { HitCircle } from "../hitObjects/HitCircle";
import { Slider } from "../hitObjects/Slider";
import { SliderPath } from "../hitObjects/SliderPath";
import { Spinner } from "../hitObjects/Spinner";
import type { Component } from "@osucad/framework";
import { EditorStackingProcessor } from "./EditorStackingProcessor";
import { EditorComboProcessor } from "./EditorComboProcessor";
import { OsuTimelineBlueprintContainer } from "./timeline/OsuTimelineBlueprintContainer";

export class OsuEditorRuleset extends EditorRuleset
{
  public readonly runtimeConfig: EditorRuntimeConfig = {
    types: [
      HitCircle,
      Slider,
      Spinner,
      SliderPath,
    ],
  };

  public override async createHitObjectComposer(): Promise<HitObjectComposer>
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

  public override createTimelineBlueprintContainer(): TimelineBlueprintContainer | null
  {
    return new OsuTimelineBlueprintContainer();
  }
}

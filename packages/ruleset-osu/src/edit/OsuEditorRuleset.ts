import type { EditorRuntimeConfig, HitObjectComposer, TimelineBlueprintContainer } from "@osucad/editor";
import { EditorRuleset, keyBinding } from "@osucad/editor";
import type { Component, KeyBinding } from "@osucad/framework";
import { HitCircle } from "../hitObjects/HitCircle";
import { Slider } from "../hitObjects/Slider";
import { SliderPath } from "../hitObjects/SliderPath";
import { Spinner } from "../hitObjects/Spinner";
import { EditorComboProcessor } from "./EditorComboProcessor";
import { EditorStackingProcessor } from "./EditorStackingProcessor";
import { OsuTimelineBlueprintContainer } from "./timeline/OsuTimelineBlueprintContainer";
import { OsuEditorAction } from "./OsuEditorAction";

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

  public override getDefaultKeyBindings(): KeyBinding[]
  {
    return [
      keyBinding("Control+Left", OsuEditorAction.NudgeLeft),
      keyBinding("Control+Right", OsuEditorAction.NudgeRight),
      keyBinding("Control+Up", OsuEditorAction.NudgeUp),
      keyBinding("Control+Down", OsuEditorAction.NudgeDown),
      keyBinding("Control+Period", OsuEditorAction.RotateClockwise),
      keyBinding("Control+Comma", OsuEditorAction.RotateCounterClockwise),
      keyBinding("Control+H", OsuEditorAction.FlipHorizontal),
      keyBinding("Control+J", OsuEditorAction.FlipVertical),
    ];
  }
}

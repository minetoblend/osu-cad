import type { ComposeToolClass, EditorRuntimeConfig, HitObjectComposer, TimelineBlueprintContainer } from "@osucad/editor";
import { EditorRuleset, keyBinding } from "@osucad/editor";
import type { Component, KeyBinding } from "@osucad/framework";
import { HitCircle } from "../hitObjects/HitCircle";
import { Slider } from "../hitObjects/Slider";
import { Spinner } from "../hitObjects/Spinner";
import type { OsuRuleset } from "../OsuRuleset";
import { EditorComboProcessor } from "./EditorComboProcessor";
import { EditorStackingProcessor } from "./EditorStackingProcessor";
import { OsuTimelineBlueprintContainer } from "./timeline/OsuTimelineBlueprintContainer";
import { OsuEditorAction } from "./OsuEditorAction";
import { SliderVelocityPoint } from "../beatmaps";
import { SelectTool } from "./tools/select/SelectTool";
import { HitCircleTool } from "./tools/circle/HitCircleTool";
import { SliderTool } from "./tools/slider/SliderTool";
import { OsuHitObjectComposer } from "./OsuHitObjectComposer";

export class OsuEditorRuleset extends EditorRuleset
{
  public constructor(public readonly ruleset: OsuRuleset)
  {
    super();
  }

  public readonly runtimeConfig: EditorRuntimeConfig = {
    types: [
      HitCircle,
      Slider,
      Spinner,
      SliderVelocityPoint,
    ],
  };

  public override createHitObjectComposer(): HitObjectComposer
  {
    return new OsuHitObjectComposer();
  }

  public override getHitObjectTools(): readonly ComposeToolClass[]
  {
    return [
      SelectTool,
      HitCircleTool,
      SliderTool,
    ];
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
      keyBinding("Control+Left", new OsuEditorAction.NudgePosition(-1, 0)),
      keyBinding("Control+Right", new OsuEditorAction.NudgePosition(1, 0)),
      keyBinding("Control+Up", new OsuEditorAction.NudgePosition(0, -1)),
      keyBinding("Control+Down", new OsuEditorAction.NudgePosition(0, 1)),
      keyBinding("Control+Period", OsuEditorAction.RotateClockwise),
      keyBinding("Control+Comma", OsuEditorAction.RotateCounterClockwise),
      keyBinding("Control+H", OsuEditorAction.FlipHorizontal),
      keyBinding("Control+J", OsuEditorAction.FlipVertical),
      keyBinding("Control+G", OsuEditorAction.ReverseSelection),
      keyBinding("Q", OsuEditorAction.ToggleNewCombo),
      keyBinding("J", OsuEditorAction.NudgeBackward),
      keyBinding("K", OsuEditorAction.NudgeForward),
      keyBinding("G", OsuEditorAction.MoveSelection),
      keyBinding("R", OsuEditorAction.Rotate),
    ];
  }
}

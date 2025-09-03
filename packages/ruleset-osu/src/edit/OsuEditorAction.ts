import { EditorAction } from "@osucad/editor";
import { TransformOrigin } from "./operators/TransformOrigin";

export class OsuEditorAction extends EditorAction
{
}

export namespace OsuEditorAction
{
  export class RotateSelection extends OsuEditorAction
  {
    public constructor(public readonly angleDegrees: number, public readonly origin: TransformOrigin)
    {
      super("RotateSelection");
    }
  }

  export class NudgePosition extends OsuEditorAction
  {
    public constructor(public readonly x: number, public readonly y: number)
    {
      super("NudgePosition");
    }
  }

  export const FlipHorizontal = new OsuEditorAction("FlipHorizontal");
  export const FlipVertical = new OsuEditorAction("FlipVertical");
  export const RotateClockwise = new OsuEditorAction.RotateSelection(90, TransformOrigin.playfield());
  export const RotateCounterClockwise = new OsuEditorAction.RotateSelection(-90, TransformOrigin.playfield());
  export const ReverseSelection = new OsuEditorAction("ReverseSelection");
  export const ToggleNewCombo = new OsuEditorAction("ToggleNewCombo");
  export const NudgeForward = new OsuEditorAction("NudgeForward");
  export const NudgeBackward = new OsuEditorAction("NudgeBackward");
  export const MoveSelection = new OsuEditorAction("MoveSelection");
  export const Rotate = new OsuEditorAction("Rotate");
}

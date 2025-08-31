import { EditorAction } from "@osucad/editor";

export class OsuEditorAction extends EditorAction
{
  public static readonly NudgeLeft = new OsuEditorAction("NudgeLeft");
  public static readonly NudgeRight = new OsuEditorAction("NudgeRight");
  public static readonly NudgeUp = new OsuEditorAction("NudgeUp");
  public static readonly NudgeDown = new OsuEditorAction("NudgeDown");
  public static readonly RotateClockwise = new OsuEditorAction("RotateClockwise");
  public static readonly RotateCounterClockwise = new OsuEditorAction("RotateCounterClockwise");
  public static readonly FlipHorizontal = new OsuEditorAction("FlipHorizontal");
  public static readonly FlipVertical = new OsuEditorAction("FlipVertical");
}

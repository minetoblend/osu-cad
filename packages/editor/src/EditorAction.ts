import { KeyBindingAction } from "@osucad/framework";

export class EditorAction extends KeyBindingAction
{
  public constructor(public readonly name: string)
  {
    super();
  }

  public override toString(): string
  {
    return `EditorAction::${this.name}`;
  }

  public static readonly TogglePlayback = new EditorAction("SeekForward");
  public static readonly SeekForward = new EditorAction("SeekForward");
  public static readonly SeekBackward = new EditorAction("SeekBackward");
  public static readonly SeekToStart = new EditorAction("SeekToStart");
  public static readonly SeekToEnd = new EditorAction("SeekToEnd");
  public static readonly PlayFromStart = new EditorAction("PlayFromStart");
}

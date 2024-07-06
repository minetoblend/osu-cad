import { KeyBindingAction } from 'osucad-framework';

export class EditorAction extends KeyBindingAction {
  constructor(readonly name: string) {
    super();
  }

  static readonly Play = new EditorAction('Play');
  static readonly FlipHorizontal = new EditorAction('FlipHorizontal');
  static readonly FlipVertical = new EditorAction('FlipVertical');
  static readonly Rotate = new EditorAction('Rotate');
  static readonly RotateCW = new EditorAction('RotateCW');
  static readonly RotateCCW = new EditorAction('RotateCCW');
  static readonly Reverse = new EditorAction('Reverse');
  static readonly ToggleNewCombo = new EditorAction('ToggleNewCombo');
  static readonly Scale = new EditorAction('Scale');
  static readonly NudgeBackward = new EditorAction('NudgeBackward');
  static readonly NudgeForward = new EditorAction('NudgeForward');
  static readonly NudgeUp = new EditorAction('NudgeUp');
  static readonly NudgeDown = new EditorAction('NudgeDown');
  static readonly NudgeLeft = new EditorAction('NudgeLeft');
  static readonly NudgeRight = new EditorAction('NudgeRight');
  static readonly SeekToStart = new EditorAction('MoveToStart');
  static readonly SeekToEnd = new EditorAction('MoveToEnd');
  static readonly PlayFromStart = new EditorAction('PlayFromStart');
}

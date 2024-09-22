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

  static readonly ToggleWhistle = new EditorAction('ToggleWhistle');
  static readonly ToggleFinish = new EditorAction('ToggleFinish');
  static readonly ToggleClap = new EditorAction('ToggleClap');

  static readonly ToggleSampleSetAuto = new EditorAction('ToggleSampleSetAuto');
  static readonly ToggleSampleSetNormal = new EditorAction('ToggleSampleSetNormal');
  static readonly ToggleSampleSetSoft = new EditorAction('ToggleSampleSetSoft');
  static readonly ToggleSampleSetDrum = new EditorAction('ToggleSampleSetDrum');

  static readonly ToggleAdditionSampleSetAuto = new EditorAction('ToggleAdditionSampleSetAuto');
  static readonly ToggleAdditionSampleSetNormal = new EditorAction('ToggleAdditionSampleSetNormal');
  static readonly ToggleAdditionSampleSetSoft = new EditorAction('ToggleAdditionSampleSetSoft');
  static readonly ToggleAdditionSampleSetDrum = new EditorAction('ToggleAdditionSampleSetDrum');

  static readonly ToggleGridSnap = new EditorAction('ToggleGridSnap');

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
  static readonly ShowPreferences = new EditorAction('ShowPreferences');
}

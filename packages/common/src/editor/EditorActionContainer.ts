import type { ContainerOptions, IKeyBinding } from 'osucad-framework';
import { InputKey, KeyBinding, KeyBindingContainer, KeyCombination, KeyCombinationMatchingMode, SimultaneousBindingMode } from 'osucad-framework';
import { EditorAction } from './EditorAction';

export class EditorActionContainer extends KeyBindingContainer<EditorAction> {
  constructor(options: ContainerOptions = {}) {
    super(SimultaneousBindingMode.None, KeyCombinationMatchingMode.Modifiers);
    this.with(options);
  }

  override get defaultKeyBindings(): IKeyBinding[] {
    const keyBindings = [
      new KeyBinding(KeyCombination.from(InputKey.Space), EditorAction.Play),
      new KeyBinding(KeyCombination.from(InputKey.C), EditorAction.Play),
      new KeyBinding(KeyCombination.from(InputKey.Control, InputKey.H), EditorAction.FlipHorizontal),
      new KeyBinding(KeyCombination.from(InputKey.Control, InputKey.J), EditorAction.FlipVertical),
      new KeyBinding(KeyCombination.from(InputKey.Control, InputKey.Shift, InputKey.R), EditorAction.Rotate),
      new KeyBinding(KeyCombination.from(InputKey.Control, InputKey.Comma), EditorAction.RotateCCW),
      new KeyBinding(KeyCombination.from(InputKey.Control, InputKey.Period), EditorAction.RotateCW),
      new KeyBinding(KeyCombination.from(InputKey.Q), EditorAction.ToggleNewCombo),
      new KeyBinding(KeyCombination.from(InputKey.W), EditorAction.ToggleWhistle),
      new KeyBinding(KeyCombination.from(InputKey.E), EditorAction.ToggleFinish),
      new KeyBinding(KeyCombination.from(InputKey.R), EditorAction.ToggleClap),
      new KeyBinding(KeyCombination.from(InputKey.Shift, InputKey.Q), EditorAction.ToggleSampleSetAuto),
      new KeyBinding(KeyCombination.from(InputKey.Shift, InputKey.W), EditorAction.ToggleSampleSetNormal),
      new KeyBinding(KeyCombination.from(InputKey.Shift, InputKey.E), EditorAction.ToggleSampleSetSoft),
      new KeyBinding(KeyCombination.from(InputKey.Shift, InputKey.R), EditorAction.ToggleSampleSetDrum),
      new KeyBinding(KeyCombination.from(InputKey.Control, InputKey.Q), EditorAction.ToggleAdditionSampleSetAuto),
      new KeyBinding(KeyCombination.from(InputKey.Control, InputKey.W), EditorAction.ToggleAdditionSampleSetNormal),
      new KeyBinding(KeyCombination.from(InputKey.Control, InputKey.E), EditorAction.ToggleAdditionSampleSetSoft),
      new KeyBinding(KeyCombination.from(InputKey.Control, InputKey.R), EditorAction.ToggleAdditionSampleSetDrum),
      new KeyBinding(KeyCombination.from(InputKey.Control, InputKey.Shift, InputKey.S), EditorAction.Scale),
      new KeyBinding(KeyCombination.from(InputKey.J), EditorAction.NudgeBackward),
      new KeyBinding(KeyCombination.from(InputKey.K), EditorAction.NudgeForward),
      new KeyBinding(KeyCombination.from(InputKey.Control, InputKey.Up), EditorAction.NudgeUp),
      new KeyBinding(KeyCombination.from(InputKey.Control, InputKey.Down), EditorAction.NudgeDown),
      new KeyBinding(KeyCombination.from(InputKey.Control, InputKey.Left), EditorAction.NudgeLeft),
      new KeyBinding(KeyCombination.from(InputKey.Control, InputKey.Right), EditorAction.NudgeRight),
      new KeyBinding(KeyCombination.from(InputKey.Z), EditorAction.SeekToStart),
      new KeyBinding(KeyCombination.from(InputKey.V), EditorAction.SeekToEnd),
      new KeyBinding(KeyCombination.from(InputKey.X), EditorAction.PlayFromStart),
      new KeyBinding(KeyCombination.from(InputKey.Control, InputKey.O), EditorAction.ShowPreferences),
      new KeyBinding(KeyCombination.from(InputKey.Control, InputKey.G), EditorAction.Reverse),
      new KeyBinding(KeyCombination.from(InputKey.T), EditorAction.ToggleGridSnap),
      new KeyBinding(KeyCombination.from(InputKey.G), EditorAction.ToggleGridSize),
      new KeyBinding(KeyCombination.from(InputKey.Control, InputKey.Shift, InputKey.P), EditorAction.CreateInheritedControlPoint),
      new KeyBinding(KeyCombination.from(InputKey.Control, InputKey.P), EditorAction.CreateUninheritedControlPoint),
      new KeyBinding(KeyCombination.from(InputKey.Control, InputKey.T), EditorAction.ShowChat),
      new KeyBinding(KeyCombination.from(InputKey.Control, InputKey.Shift, InputKey.F), EditorAction.ConvertToStream),
    ];

    if (navigator.userAgent.includes('Mac')) {
      keyBindings.push(
        new KeyBinding(KeyCombination.from(InputKey.Meta, InputKey.Up), EditorAction.NudgeUp),
        new KeyBinding(KeyCombination.from(InputKey.Meta, InputKey.Down), EditorAction.NudgeDown),
        new KeyBinding(KeyCombination.from(InputKey.Meta, InputKey.Left), EditorAction.NudgeLeft),
        new KeyBinding(KeyCombination.from(InputKey.Meta, InputKey.Right), EditorAction.NudgeRight),
      );
    }

    return keyBindings;
  }
}

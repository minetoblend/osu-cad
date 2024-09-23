import type { Vec2 } from '../../math';
import type { InputState } from '../state/InputState';
import { debugAssert } from '../../utils/debugAssert';
import { compareInputKeys, InputKey, isPhysical, isVirtual } from '../state/InputKey';
import { Key } from '../state/Key';
import { MouseButton } from '../state/MouseButton';

export class KeyCombination {
  readonly keys: readonly InputKey[];

  private static none: InputKey[] = [InputKey.None];

  private constructor(keys: readonly InputKey[] = []) {
    if (!keys.length) {
      this.keys = KeyCombination.none;
      return;
    }

    const keyBuilder: InputKey[] = [];

    for (let i = 0; i < keys.length; i++) {
      const key = keys[i];

      if (keyBuilder.includes(key)) {
        continue;
      }

      keyBuilder.push(key);
    }

    keyBuilder.sort(compareInputKeys);

    this.keys = keyBuilder;
  }

  isPressed(pressedKeys: KeyCombination, inputState: InputState, matchingMode: KeyCombinationMatchingMode): boolean {
    debugAssert(!pressedKeys.keys.includes(InputKey.None)); // Having None in pressed keys will break IsPressed

    if (arrayEquals(this.keys, pressedKeys.keys))
      // Fast test for reference equality of underlying array
      return true;

    if (arrayEquals(this.keys, KeyCombination.none))
      return false;

    return containsAll(this.keys, pressedKeys.keys, matchingMode);
  }

  static isPressed(pressedPhysicalKeys: readonly InputKey[], candidateKey: InputKey) {
    if (isPhysical(candidateKey)) {
      return pressedPhysicalKeys.includes(candidateKey);
    }

    debugAssert(isVirtual(candidateKey));
    return pressedPhysicalKeys.some(k => this.getVirtualKey(k) === candidateKey);
  }

  static from(...keys: InputKey[]): KeyCombination {
    return new KeyCombination(keys);
  }

  static fromMouseButton(button: MouseButton): InputKey {
    switch (button) {
      case MouseButton.Left:
        return InputKey.MouseLeftButton;
      case MouseButton.Right:
        return InputKey.MouseRightButton;
      case MouseButton.Middle:
        return InputKey.MouseMiddleButton;
      default:
        // TODO: Add the rest of the buttons
        console.warn('Unknown mouse button:', button);
        return InputKey.None;
    }
  }

  static keyMap: Record<Key, InputKey> = {
    [Key.ShiftLeft]: InputKey.LShift,
    [Key.ShiftRight]: InputKey.RShift,
    [Key.ControlLeft]: InputKey.LControl,
    [Key.ControlRight]: InputKey.RControl,
    [Key.AltLeft]: InputKey.LAlt,
    [Key.AltRight]: InputKey.RAlt,
    [Key.MetaLeft]: InputKey.LMeta,
    [Key.MetaRight]: InputKey.RMeta,
    [Key.Unidentified]: InputKey.None,
    [Key.Escape]: InputKey.Escape,
    [Key.Digit1]: InputKey.Number1,
    [Key.Digit2]: InputKey.Number2,
    [Key.Digit3]: InputKey.Number3,
    [Key.Digit4]: InputKey.Number4,
    [Key.Digit5]: InputKey.Number5,
    [Key.Digit6]: InputKey.Number6,
    [Key.Digit7]: InputKey.Number7,
    [Key.Digit8]: InputKey.Number8,
    [Key.Digit9]: InputKey.Number9,
    [Key.Digit0]: InputKey.Number0,
    [Key.Minus]: InputKey.Minus,
    [Key.Equal]: InputKey.None,
    [Key.Backspace]: InputKey.BackSpace,
    [Key.Tab]: InputKey.Tab,
    [Key.KeyA]: InputKey.A,
    [Key.KeyB]: InputKey.B,
    [Key.KeyC]: InputKey.C,
    [Key.KeyD]: InputKey.D,
    [Key.KeyE]: InputKey.E,
    [Key.KeyF]: InputKey.F,
    [Key.KeyG]: InputKey.G,
    [Key.KeyH]: InputKey.H,
    [Key.KeyI]: InputKey.I,
    [Key.KeyJ]: InputKey.J,
    [Key.KeyK]: InputKey.K,
    [Key.KeyL]: InputKey.L,
    [Key.KeyM]: InputKey.M,
    [Key.KeyN]: InputKey.N,
    [Key.KeyO]: InputKey.O,
    [Key.KeyP]: InputKey.P,
    [Key.KeyQ]: InputKey.Q,
    [Key.KeyR]: InputKey.R,
    [Key.KeyS]: InputKey.S,
    [Key.KeyT]: InputKey.T,
    [Key.KeyU]: InputKey.U,
    [Key.KeyV]: InputKey.V,
    [Key.KeyW]: InputKey.W,
    [Key.KeyX]: InputKey.X,
    [Key.KeyY]: InputKey.Y,
    [Key.KeyZ]: InputKey.Z,
    [Key.BracketLeft]: InputKey.BracketLeft,
    [Key.BracketRight]: InputKey.BracketRight,
    [Key.Enter]: InputKey.Enter,
    [Key.Semicolon]: InputKey.Semicolon,
    [Key.Quote]: InputKey.Quote,
    [Key.Backquote]: InputKey.None,
    [Key.Backslash]: InputKey.Backslash,

    [Key.Comma]: InputKey.Comma,
    [Key.Period]: InputKey.Period,
    [Key.Slash]: InputKey.Slash,
    [Key.NumpadMultiply]: InputKey.KeypadMultiply,
    [Key.Space]: InputKey.Space,
    [Key.CapsLock]: InputKey.CapsLock,
    [Key.F1]: InputKey.F1,
    [Key.F2]: InputKey.F2,
    [Key.F3]: InputKey.F3,
    [Key.F4]: InputKey.F4,
    [Key.F5]: InputKey.F5,
    [Key.F6]: InputKey.F6,
    [Key.F7]: InputKey.F7,
    [Key.F8]: InputKey.F8,
    [Key.F9]: InputKey.F9,
    [Key.F10]: InputKey.F10,
    [Key.F11]: InputKey.None,
    [Key.F12]: InputKey.None,
    [Key.F13]: InputKey.None,
    [Key.F14]: InputKey.None,
    [Key.F15]: InputKey.None,
    [Key.F16]: InputKey.None,
    [Key.F17]: InputKey.None,
    [Key.F18]: InputKey.None,
    [Key.F19]: InputKey.None,
    [Key.F20]: InputKey.None,
    [Key.F21]: InputKey.None,
    [Key.F22]: InputKey.None,
    [Key.F23]: InputKey.None,
    [Key.F24]: InputKey.None,
    [Key.Pause]: InputKey.Pause,
    [Key.ScrollLock]: InputKey.ScrollLock,
    [Key.Numpad1]: InputKey.Keypad1,
    [Key.Numpad2]: InputKey.Keypad2,
    [Key.Numpad3]: InputKey.Keypad3,
    [Key.Numpad4]: InputKey.Keypad4,
    [Key.Numpad5]: InputKey.Keypad5,
    [Key.Numpad6]: InputKey.Keypad6,
    [Key.Numpad7]: InputKey.Keypad7,
    [Key.Numpad8]: InputKey.Keypad8,
    [Key.Numpad9]: InputKey.Keypad9,
    [Key.Numpad0]: InputKey.Keypad0,
    [Key.NumpadSubtract]: InputKey.None,
    [Key.NumpadAdd]: InputKey.KeypadAdd,
    [Key.NumpadDecimal]: InputKey.KeypadDecimal,
    [Key.NumpadEqual]: InputKey.None,
    [Key.NumpadComma]: InputKey.KeypadDecimal,
    [Key.NumpadEnter]: InputKey.KeypadEnter,
    [Key.NumpadDivide]: InputKey.KeypadDivide,
    [Key.IntlBackslash]: InputKey.None,
    [Key.KanaMode]: InputKey.None,
    [Key.Lang2]: InputKey.None,
    [Key.Lang1]: InputKey.None,
    [Key.IntlRo]: InputKey.None,
    [Key.Convert]: InputKey.None,
    [Key.NonConvert]: InputKey.None,
    [Key.IntlYen]: InputKey.None,
    [Key.MediaTrackPrevious]: InputKey.None,
    [Key.MediaTrackNext]: InputKey.None,
    [Key.AudioVolumeMute]: InputKey.None,
    [Key.LaunchApp2]: InputKey.None,
    [Key.MediaPlayPause]: InputKey.None,
    [Key.MediaStop]: InputKey.None,
    [Key.BrowserHome]: InputKey.None,
    [Key.PrintScreen]: InputKey.None,
    [Key.NumLock]: InputKey.None,
    [Key.ArrowLeft]: InputKey.Left,
    [Key.ArrowRight]: InputKey.Right,
    [Key.ArrowUp]: InputKey.Up,
    [Key.ArrowDown]: InputKey.Down,
    [Key.PageUp]: InputKey.PageUp,
    [Key.PageDown]: InputKey.None,
    [Key.Home]: InputKey.Home,
    [Key.End]: InputKey.End,
    [Key.Insert]: InputKey.Insert,
    [Key.Delete]: InputKey.Delete,
    [Key.ContextMenu]: InputKey.Menu,
    [Key.Power]: InputKey.None,
    [Key.BrowserSearch]: InputKey.None,
    [Key.BrowserFavorites]: InputKey.None,
    [Key.BrowserRefresh]: InputKey.None,
    [Key.BrowserStop]: InputKey.None,
    [Key.BrowserForward]: InputKey.None,
    [Key.BrowserBack]: InputKey.None,
    [Key.LaunchApp1]: InputKey.None,
    [Key.LaunchMail]: InputKey.None,
    [Key.MediaSelect]: InputKey.None,
  };

  static fromKey(key: Key): InputKey {
    return KeyCombination.keyMap[key] ?? InputKey.None;
  }

  static fromScrollDelta(delta: Vec2): InputKey[] {
    const keys: InputKey[] = [];
    if (delta.y > 0)
      keys.push(InputKey.MouseWheelUp);
    if (delta.y < 0)
      keys.push(InputKey.MouseWheelDown);
    if (delta.x > 0)
      keys.push(InputKey.MouseWheelRight);
    if (delta.x < 0)
      keys.push(InputKey.MouseWheelLeft);
    return keys;
  }

  static isModifierKey(key: InputKey): boolean {
    switch (key) {
      case InputKey.LControl:
      case InputKey.LShift:
      case InputKey.LAlt:
      case InputKey.LMeta:
      case InputKey.RControl:
      case InputKey.RShift:
      case InputKey.RAlt:
      case InputKey.RMeta:
      case InputKey.Control:
      case InputKey.Shift:
      case InputKey.Alt:
      case InputKey.Meta:
        return true;
    }

    return false;
  }

  static keyBindingContains(candidateKeyBinding: readonly InputKey[], physicalKey: InputKey): boolean {
    if (candidateKeyBinding.includes(physicalKey))
      return true;

    const virtualKey = this.getVirtualKey(physicalKey);

    if (virtualKey !== null) {
      return candidateKeyBinding.includes(virtualKey);
    }

    return false;
  }

  static getVirtualKey(key: InputKey): InputKey | null {
    switch (key) {
      case InputKey.LShift:
      case InputKey.RShift:
        return InputKey.Shift;

      case InputKey.LControl:
      case InputKey.RControl:
        return InputKey.Control;

      case InputKey.LAlt:
      case InputKey.RAlt:
        return InputKey.Alt;

      case InputKey.LMeta:
      case InputKey.RMeta:
        return InputKey.Meta;
    }

    return null;
  }
}

export enum KeyCombinationMatchingMode {
  Any,
  Exact,
  Modifiers,
}

function arrayEquals<T>(a: readonly T[], b: readonly T[]): boolean {
  if (a.length !== b.length) {
    return false;
  }

  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) {
      return false;
    }
  }

  return true;
}

function containsAll(
  candidateKeyBinding: readonly InputKey[],
  pressedPhysicalKeys: readonly InputKey[],
  matchingMode: KeyCombinationMatchingMode,
): boolean {
  debugAssert(pressedPhysicalKeys.every(key => isPhysical(key)));

  for (const key of candidateKeyBinding) {
    if (!KeyCombination.isPressed(pressedPhysicalKeys, key)) {
      return false;
    }
  }

  switch (matchingMode) {
    case KeyCombinationMatchingMode.Exact:
      for (const key of pressedPhysicalKeys) {
        // in exact matching mode, every pressed key needs to be in the candidate.
        if (!KeyCombination.keyBindingContains(candidateKeyBinding, key)) {
          return false;
        }
      }

      break;

    case KeyCombinationMatchingMode.Modifiers:
      for (const key of pressedPhysicalKeys) {
        // in modifiers match mode, the same check applies as exact but only for modifier keys.
        if (KeyCombination.isModifierKey(key) && !KeyCombination.keyBindingContains(candidateKeyBinding, key)) {
          return false;
        }
      }

      break;

    case KeyCombinationMatchingMode.Any:
      // any match mode needs no further checks.
      break;
  }

  return true;
}

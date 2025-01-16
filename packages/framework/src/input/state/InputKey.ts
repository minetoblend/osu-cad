/* eslint-disable ts/no-duplicate-enum-values */
export enum InputKey {
  None = 0,
  Shift = 1,
  Control = 3,
  Alt = 5,
  Meta = 7,
  Menu = 9,

  F1 = 10,
  F2 = 11,
  F3 = 12,
  F4 = 13,
  F5 = 14,
  F6 = 15,
  F7 = 16,
  F8 = 17,
  F9 = 18,
  F10 = 19,
  F11 = 20,
  F12 = 21,
  F13 = 22,
  F14 = 23,
  F15 = 24,
  F16 = 25,
  F17 = 26,
  F18 = 27,
  F19 = 28,
  F20 = 29,
  F21 = 30,
  F22 = 31,
  F23 = 32,
  F24 = 33,
  F25 = 34,
  F26 = 35,
  F27 = 36,
  F28 = 37,
  F29 = 38,
  F30 = 39,
  F31 = 40,
  F32 = 41,
  F33 = 42,
  F34 = 43,
  F35 = 44,

  Up = 45,
  Down = 46,
  Left = 47,
  Right = 48,

  Enter = 49,
  Escape = 50,
  Space = 51,
  Tab = 52,
  BackSpace = 53,
  Back = BackSpace,
  Insert = 54,
  Delete = 55,
  PageUp = 56,
  PageDown = 57,
  Home = 58,
  End = 59,
  CapsLock = 60,
  ScrollLock = 61,
  PrintScreen = 62,
  Pause = 63,
  NumLock = 64,
  Clear = 65,
  Sleep = 66,

  Keypad0 = 67,
  Keypad1 = 68,
  Keypad2 = 69,
  Keypad3 = 70,
  Keypad4 = 71,
  Keypad5 = 72,
  Keypad6 = 73,
  Keypad7 = 74,
  Keypad8 = 75,
  Keypad9 = 76,
  KeypadDivide = 77,
  KeypadMultiply = 78,
  KeypadSubtract = 79,
  KeypadMinus = KeypadSubtract,
  KeypadAdd = 80,
  KeypadPlus = KeypadAdd,
  KeypadDecimal = 81,
  KeypadPeriod = KeypadDecimal,
  KeypadEnter = 82,

  A = 83,
  B = 84,
  C = 85,
  D = 86,
  E = 87,
  F = 88,
  G = 89,
  H = 90,
  I = 91,
  J = 92,
  K = 93,
  L = 94,
  M = 95,
  N = 96,
  O = 97,
  P = 98,
  Q = 99,
  R = 100,
  S = 101,
  T = 102,
  U = 103,
  V = 104,
  W = 105,
  X = 106,
  Y = 107,
  Z = 108,

  Number0 = 109,
  Number1 = 110,
  Number2 = 111,
  Number3 = 112,
  Number4 = 113,
  Number5 = 114,
  Number6 = 115,
  Number7 = 116,
  Number8 = 117,
  Number9 = 118,

  Tilde = 119,
  Grave = Tilde,

  Minus = 120,
  Plus = 121,
  BracketLeft = 122,
  LBracket = BracketLeft,
  BracketRight = 123,
  RBracket = BracketRight,
  Semicolon = 124,
  Quote = 125,
  Comma = 126,
  Period = 127,
  Slash = 128,
  Backslash = 129,
  NonUSBackSlash = 130,
  LastKey = 131,

  // Mouse buttons
  FirstMouseButton = 132,
  MouseLeftButton = 132,
  MouseMiddleButton = 133,
  MouseRightButton = 134,

  ExtraMouseButton1 = 135,
  ExtraMouseButton2 = 136,
  ExtraMouseButton3 = 137,
  ExtraMouseButton4 = 138,
  ExtraMouseButton5 = 139,
  ExtraMouseButton6 = 140,
  ExtraMouseButton7 = 141,
  ExtraMouseButton8 = 142,
  ExtraMouseButton9 = 143,

  MouseLastButton = 144,

  MouseWheelUp = 145,
  MouseWheelDown = 146,
  MouseWheelRight = 147,
  MouseWheelLeft = 148,

  Mute = 256,

  LShift,
  RShift,
  LControl,
  RControl,
  LAlt,
  RAlt,
  LMeta,
  RMeta,
}

function getOrder(key: InputKey): number | null {
  switch (key) {
    case InputKey.None:
      return -1;
    case InputKey.Shift:
    case InputKey.LShift:
    case InputKey.RShift:
      return 3;
    case InputKey.Control:
    case InputKey.LControl:
    case InputKey.RControl:
      return 1;
    case InputKey.Alt:
    case InputKey.LAlt:
    case InputKey.RAlt:
      return 2;
    case InputKey.Meta:
    case InputKey.LMeta:
    case InputKey.RMeta:
      return 4;
    default:
      return null;
  }
}

export function compareInputKeys(a: InputKey, b: InputKey): number {
  const orderA = getOrder(a);
  const orderB = getOrder(b);
  if (orderA !== null && orderB !== null) {
    return orderA - orderB;
  }

  return a - b;
}

export function isVirtual(key: InputKey) {
  switch (key) {
    case InputKey.Shift:
    case InputKey.Control:
    case InputKey.Alt:
    case InputKey.Meta:
      return true;
  }

  return false;
}

export function isPhysical(key: InputKey) {
  return !isVirtual(key);
}

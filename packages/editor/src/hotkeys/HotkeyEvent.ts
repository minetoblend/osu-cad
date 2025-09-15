import type { Drawable, InputKey, InputState, KeyBindingAction, KeyCombination } from "@osucad/framework";

export abstract class HotkeyEvent
{
  protected constructor(
    public readonly state: InputState,
    public readonly target: Drawable,
  )
  {
  }
}

export class HotkeyKeyEvent extends HotkeyEvent
{
  public constructor(
    state: InputState,
    target: Drawable,
    public readonly key: InputKey,
    public readonly keyCombination: KeyCombination,
  )
  {
    super(state, target);
  }
}


export class HotkeyKeyBindingEvent<T extends KeyBindingAction = KeyBindingAction> extends HotkeyEvent
{
  public constructor(
    state: InputState,
    target: Drawable,
    public readonly action: T,
  )
  {
    super(state, target);
  }
}

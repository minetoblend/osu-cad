import type { Drawable, IKeyBindingHandler, InputKey, InputManager, KeyBindingAction, KeyBindingPressEvent, KeyBindingReleaseEvent, KeyDownEvent, KeyUpEvent, MouseDownEvent, MouseUpEvent } from "@osucad/framework";
import { Component, KeyCombination } from "@osucad/framework";
import type { HotkeyHandler } from "./HotkeyHandler";
import { Hotkeys } from "./Hotkeys";
import { HotkeyKeyBindingEvent, HotkeyKeyEvent } from "./HotkeyEvent";

export class HotkeyListener extends Component implements IKeyBindingHandler<KeyBindingAction>
{
  public constructor(
    public readonly target: Drawable,
  )
  {
    super();

    this.hotkeys = Hotkeys.getHotkeys(target);
  }

  public readonly isKeyBindingHandler = true;

  public canHandleKeyBinding(binding: KeyBindingAction): boolean
  {
    return true;
  }

  public onKeyBindingPressed(e: KeyBindingPressEvent<KeyBindingAction>): boolean
  {
    const event = new HotkeyKeyBindingEvent(this.#inputManager.currentState, this.target, e.pressed);

    for (const listener of this.hotkeys)
    {
      if (listener.test(event) && listener.onPress.call(this.target, event))
        return true;
    }

    return false;
  }

  public onKeyBindingReleased(e: KeyBindingReleaseEvent<KeyBindingAction>): void
  {
    const event = new HotkeyKeyBindingEvent(this.#inputManager.currentState, this.target, e.pressed);

    for (const listener of this.hotkeys)
    {
      if (listener.test(event))
        listener.onRelease.call(this.target, event);
    }
  }

  public readonly hotkeys: HotkeyHandler[];

  readonly #pressedKeys = new Set<InputKey>();
  readonly #pressedHotkeys: HotkeyHandler[] = [];

  #inputManager!: InputManager;

  protected override loadComplete()
  {
    super.loadComplete();

    this.#inputManager = this.getContainingInputManager()!;
  }

  protected override onKeyDown(e: KeyDownEvent): boolean
  {
    return this.#onPress(KeyCombination.fromKey(e.key));
  }

  protected override onKeyUp(e: KeyUpEvent)
  {
    super.onKeyUp(e);

    this.#onRelease(KeyCombination.fromKey(e.key));
  }

  protected override onMouseDown(e: MouseDownEvent): boolean
  {
    if (this.#onPress(KeyCombination.fromMouseButton(e.button)))
      return true;

    return super.onMouseDown(e);
  }

  protected override onMouseUp(e: MouseUpEvent)
  {
    this.#onRelease(KeyCombination.fromMouseButton(e.button));

    super.onMouseUp(e);
  }

  #onPress(inputKey: InputKey)
  {
    if (this.#pressedKeys.has(inputKey))
      return false;

    this.#pressedKeys.add(inputKey);

    const combination = KeyCombination.from(...this.#pressedKeys);

    const event = new HotkeyKeyEvent(this.#inputManager.currentState, this.target, inputKey, combination);

    for (const listener of this.hotkeys)
    {
      if (listener.test(event) && listener.onPress.call(this.target, event))
      {
        this.#pressedHotkeys.push(listener);
        return true;
      }
    }

    return false;
  }

  #onRelease(inputKey: InputKey)
  {
    if (!this.#pressedKeys.delete(inputKey))
      return;

    const keyCombination = KeyCombination.from(...this.#pressedKeys, inputKey);

    const event = new HotkeyKeyEvent(this.#inputManager.currentState, this.target, inputKey, keyCombination);

    for (let i = 0; i < this.#pressedHotkeys.length; i++)
    {
      const listener = this.#pressedHotkeys[i];

      if (listener.test(event))
      {
        this.#pressedHotkeys.splice(i--, 1);
        listener.onRelease.call(this.target, event);
      }
    }
  }
}

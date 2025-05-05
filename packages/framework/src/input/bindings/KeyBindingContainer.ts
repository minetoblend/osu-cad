import type { Drawable } from "../../graphics/drawables/Drawable";
import type { Vec2 } from "../../math";
import type { KeyBindingAction } from "../KeyBindingAction";
import type { IKeyBinding } from "./IKeyBinding";
import { Container } from "../../graphics/containers/Container";
import { Axes } from "../../graphics/drawables/Axes";
import { List } from "../../utils";
import { KeyDownEvent, KeyUpEvent, MouseDownEvent, MouseUpEvent, ScrollEvent, type UIEvent } from "../events";
import { KeyBindingPressEvent } from "../events/KeyBindingPressEvent";
import { KeyBindingReleaseEvent } from "../events/KeyBindingReleaseEvent";
import { KeyBindingScrollEvent } from "../events/KeyBindingScrollEvent";
import { InputKey } from "../state/InputKey";
import { InputState } from "../state/InputState";
import { isKeyBindingHandler } from "./IKeyBindingHandler";
import { KeyCombination, KeyCombinationMatchingMode } from "./KeyCombination";

export abstract class BaseKeyBindingContainer extends Container 
{
  protected keyBindings: IKeyBinding[] | null = null;

  abstract get defaultKeyBindings(): IKeyBinding[];

  protected override loadComplete(): void 
  {
    super.loadComplete();

    this.reloadMappings();
  }

  protected reloadMappings(): void 
  {
    this.keyBindings = this.defaultKeyBindings;
  }
}

export abstract class KeyBindingContainer<T extends KeyBindingAction> extends BaseKeyBindingContainer 
{
  readonly #simultaneousMode: SimultaneousBindingMode;
  readonly #matchingMode: KeyCombinationMatchingMode;

  protected constructor(
    simultaneousMode: SimultaneousBindingMode = SimultaneousBindingMode.None,
    matchingMode: KeyCombinationMatchingMode = KeyCombinationMatchingMode.Any,
  ) 
  {
    super();
    this.relativeSizeAxes = Axes.Both;

    this.#simultaneousMode = simultaneousMode;
    this.#matchingMode = matchingMode;
  }

  override get handlePositionalInput(): boolean 
  {
    return true;
  }

  override get handleNonPositionalInput(): boolean 
  {
    return true;
  }

  #pressedBindings: IKeyBinding[] = [];

  #pressedActions: T[] = [];

  get pressedActions(): readonly T[] 
  {
    return this.#pressedActions;
  }

  readonly #keyBindingQueues = new Map<IKeyBinding, Drawable[]>();

  #queue = new List<Drawable>(250);

  #keyRepeatInputQueue: Drawable[] = [];

  protected get keyBindingInputQueue(): List<Drawable> 
  {
    this.#queue.clear();
    this.buildNonPositionalInputQueue(this.#queue, false);
    this.#queue.reverse();

    return this.#queue;
  }

  override update(): void 
  {
    super.update();

    this.#queue.clear();
  }

  protected get prioritised() 
  {
    return false;
  }

  override buildNonPositionalInputQueue(queue: List<Drawable>, allowBlocking: boolean = true): boolean 
  {
    if (!super.buildNonPositionalInputQueue(queue, allowBlocking))
      return false;

    if (this.prioritised) 
    {
      queue.remove(this);
      queue.push(this);
    }

    return true;
  }

  override buildPositionalInputQueue(screenSpacePos: Vec2, queue: List<Drawable>): boolean 
  {
    if (!super.buildPositionalInputQueue(screenSpacePos, queue))
      return false;

    if (this.prioritised) 
    {
      const index = queue.indexOf(this);
      if (index !== -1) 
      {
        queue.splice(index, 1);
      }
      queue.push(this);
    }

    return true;
  }

  #pressedInputKeys = new Set<InputKey>();

  override handle(e: UIEvent): boolean 
  {
    const state = e.state;

    switch (e.constructor) 
    {
    case MouseDownEvent: {
      const mouseDown = e as MouseDownEvent;
      return this.#handleNewPressed(state, KeyCombination.fromMouseButton(mouseDown.button));
    }

    case MouseUpEvent: {
      const mouseUp = e as MouseUpEvent;
      this.#handleNewReleased(state, KeyCombination.fromMouseButton(mouseUp.button));
      return false;
    }

    case KeyDownEvent: {
      const keyDown = e as KeyDownEvent;
      if (keyDown.repeat) 
      {
        this.#handleRepeat(state);
        return false;
      }
      const inputKey = KeyCombination.fromKey(keyDown.key);
      if (inputKey === InputKey.None)
        return false;

      return this.#handleNewPressed(state, inputKey);
    }

    case KeyUpEvent: {
      const keyUp = e as KeyUpEvent;
      const inputKey = KeyCombination.fromKey(keyUp.key);
      if (inputKey === InputKey.None)
        return false;

      this.#handleNewReleased(state, inputKey);
    }
      return false;
    case ScrollEvent: {
      const scroll = e as ScrollEvent;
      const keys = KeyCombination.fromScrollDelta((e as ScrollEvent).scrollDelta);
      let handled = false;

      for (const key of keys) 
      {
        if (this.#handleNewPressed(state, key, scroll.scrollDelta, scroll.isPrecise)) 
        {
          handled = true;
          this.#handleNewReleased(state, key, scroll.scrollDelta, scroll.isPrecise);
        }
      }

      return handled;
    }
    }

    return false;
  }

  // TODO: #handleRepeat

  readonly #newlyPressed: IKeyBinding[] = [];

  #handleNewPressed(state: InputState, newKey: InputKey, scrollDelta?: Vec2, isPrecise: boolean = false): boolean 
  {
    this.#pressedInputKeys.add(newKey);

    const scrollAmount = this.#getScrollAmount(newKey, scrollDelta);

    const pressedCombination = KeyCombination.from(...this.#pressedInputKeys);

    let handled = false;

    this.#newlyPressed.length = 0;

    if (this.keyBindings !== null) 
    {
      for (const binding of this.keyBindings) 
      {
        if (this.#pressedBindings.includes(binding)) 
        {
          continue;
        }

        if (binding.keyCombination.isPressed(pressedCombination, state, this.#matchingMode)) 
        {
          this.#newlyPressed.push(binding);
        }
      }
    }

    if (KeyCombination.isModifierKey(newKey)) 
    {
      for (let i = 0; i < this.#newlyPressed.length; i++) 
      {
        if (!this.#newlyPressed[i].keyCombination.keys.every(key => KeyCombination.isModifierKey(key))) 
        {
          this.#newlyPressed.splice(i--, 1);
        }
      }
    }

    this.#newlyPressed.sort((a, b) => b.keyCombination.keys.length - a.keyCombination.keys.length);

    this.#pressedBindings.push(...this.#newlyPressed);

    if (
      this.#simultaneousMode === SimultaneousBindingMode.None
      && (this.#matchingMode === KeyCombinationMatchingMode.Exact
        || this.#matchingMode === KeyCombinationMatchingMode.Modifiers)
    ) 
    {
      if (
        this.#pressedBindings.length > 0
        && !this.#pressedBindings.some(m => m.keyCombination.isPressed(pressedCombination, state, this.#matchingMode))
      ) 
      {
        this.#releasePressedActions(state);
      }
    }

    for (const newBinding of this.#newlyPressed) 
    {
      if (this.#simultaneousMode === SimultaneousBindingMode.None) 
      {
        this.#releasePressedActions(state);
      }

      const inputQueue = this.#getInputQueue(newBinding, true);

      const handledBy = this.propagatePressed(inputQueue, state, newBinding.getAction(), scrollAmount, isPrecise);

      if (handledBy !== null) 
      {
        // only drawables up to the one that handled the press should handle the release, so remove all subsequent drawables from the queue (for future use).
        const count = inputQueue.indexOf(handledBy) + 1;
        inputQueue.splice(count, inputQueue.length - count);

        handled = true;
      }

      this.#keyRepeatInputQueue = inputQueue;

      // we only want to handle the first valid binding (the one with the most keys) in non-simultaneous mode.
      if (this.#simultaneousMode === SimultaneousBindingMode.None && handled)
        break;
    }

    return handled;
  }

  #getScrollAmount(newKey: InputKey, scrollDelta?: Vec2): number 
  {
    switch (newKey) 
    {
    case InputKey.MouseWheelUp:
      return scrollDelta?.y ?? 0;

    case InputKey.MouseWheelDown:
      return -(scrollDelta?.y ?? 0);

    case InputKey.MouseWheelRight:
      return scrollDelta?.x ?? 0;

    case InputKey.MouseWheelLeft:
      return -(scrollDelta?.x ?? 0);

    default:
      return 0;
    }
  }

  protected propagatePressed(
    drawables: Drawable[] | List<Drawable>,
    state: InputState,
    pressed: T,
    scrollAmount: number = 0,
    isPrecise: boolean = false,
    repeat: boolean = false,
  ): Drawable | null 
  {
    let handled: Drawable | null = null;

    if (this.#simultaneousMode === SimultaneousBindingMode.All || !this.#pressedActions.includes(pressed)) 
    {
      this.#pressedActions.push(pressed);

      if (scrollAmount !== 0) 
      {
        const scrollEvent = new KeyBindingScrollEvent<T>(state, pressed, scrollAmount, isPrecise);
        handled = drawables.find(d => this.#triggerKeyBindingEvent(d, scrollEvent)) ?? null;
      }

      if (handled === null) 
      {
        const pressEvent = new KeyBindingPressEvent<T>(state, pressed, repeat);
        handled = drawables.find(d => this.#triggerKeyBindingEvent(d, pressEvent)) ?? null;
      }
    }

    if (handled) 
    {
      console.debug(`Keybinding ${JSON.stringify(pressed)} handled by ${handled.label ?? handled.constructor.name}`);
    }
    else 
    {
      console.debug(`Keybinding ${JSON.stringify(pressed)} not handled`);
    }

    return handled ?? null;
  }

  #releasePressedActions(state: InputState): void 
  {
    for (const action of this.#pressedActions) 
    {
      const releaseEvent = new KeyBindingReleaseEvent<T>(state, action);

      for (const [binding, drawables] of this.#keyBindingQueues.entries()) 
      {
        if (binding.getAction() === action) 
        {
          drawables.forEach(d => this.#triggerKeyBindingEvent(d, releaseEvent));
        }
      }
    }

    this.#pressedActions.length = 0;
  }

  #handleNewReleased(state: InputState, releasedKey: InputKey, scrollDelta?: Vec2, isPrecise: boolean = false) 
  {
    this.#pressedInputKeys.delete(releasedKey);

    if (this.#pressedBindings.length === 0)
      return;

    // we don't want to consider exact matching here as we are dealing with bindings, not actions.
    const pressedCombination = KeyCombination.from(...this.#pressedInputKeys);

    for (let i = 0; i < this.#pressedBindings.length; i++) 
    {
      const binding = this.#pressedBindings[i];

      if (
        this.#pressedInputKeys.size === 0
        || !binding.keyCombination.isPressed(pressedCombination, state, KeyCombinationMatchingMode.Any)
      ) 
      {
        this.#pressedBindings.splice(i--, 1);
        this.propagateReleased(
            this.#getInputQueue(binding).filter(d => d.isRootedAt(this)),
            state,
            binding.getAction(),
        );
        const queue = this.#keyBindingQueues.get(binding);
        if (queue) 
        {
          queue.length = 0;
        }
      }
    }
  }

  protected propagateReleased(drawables: Drawable[] | List<Drawable>, state: InputState, released: T) 
  {
    if (
      this.#simultaneousMode === SimultaneousBindingMode.All
      || (this.#pressedActions.includes(released) && this.#pressedBindings.every(b => b.getAction() !== released))
    ) 
    {
      const releaseEvent = new KeyBindingReleaseEvent<T>(state, released);

      for (const d of drawables) 
      {
        if (isKeyBindingHandler(d, released)) 
        {
          this.#triggerKeyBindingEvent(d, releaseEvent);
        }
      }

      const index = this.#pressedActions.indexOf(released);
      if (index !== -1) 
      {
        this.#pressedActions.splice(index, 1);
      }
    }
  }

  triggerReleased(released: T) 
  {
    this.propagateReleased(
        this.keyBindingInputQueue,
        this.getContainingInputManager()?.currentState ?? new InputState(),
        released,
    );
  }

  triggerPressed(pressed: T): Drawable | null 
  {
    const state = this.getContainingInputManager()?.currentState ?? new InputState();

    if (this.#simultaneousMode === SimultaneousBindingMode.None) 
    {
      this.#releasePressedActions(state);
    }

    return this.propagatePressed(this.keyBindingInputQueue, state, pressed);
  }

  #getInputQueue(binding: IKeyBinding, rebuildIfEmpty: boolean = false): Drawable[] 
  {
    if (!this.#keyBindingQueues.has(binding)) 
    {
      this.#keyBindingQueues.set(binding, []);
    }

    const currentQueue = this.#keyBindingQueues.get(binding)!;

    if (rebuildIfEmpty && currentQueue.length === 0) 
    {
      currentQueue.push(...this.keyBindingInputQueue);
    }

    return currentQueue;
  }

  #triggerKeyBindingEvent(
    drawable: Drawable,
    e: KeyBindingPressEvent<T> | KeyBindingReleaseEvent<T> | KeyBindingScrollEvent<T>,
  ): boolean 
  {
    e.target = drawable;

    if (!isKeyBindingHandler(drawable, e.pressed))
      return false;

    switch (e.constructor) 
    {
    case KeyBindingPressEvent: {
      const press = e as KeyBindingPressEvent<T>;
      return drawable.onKeyBindingPressed?.(press) ?? false;
    }

    case KeyBindingReleaseEvent: {
      const release = e as KeyBindingReleaseEvent<T>;
      drawable.onKeyBindingReleased?.(release);
      return false;
    }

    case KeyBindingScrollEvent: {
      const scroll = e as KeyBindingScrollEvent<T>;
      return drawable.onScrollKeyBinding?.(scroll) ?? false;
    }

    default:
      throw new Error(`Invalid event type:${e.constructor.name}`);
    }
  }

  get handleRepeats() 
  {
    return true;
  }

  #handleRepeat(state: InputState) 
  {
    if (!this.handleRepeats) 
    {
      return false;
    }

    if (this.#pressedActions.length === 0) 
    {
      return false;
    }

    const action = this.#pressedActions[this.#pressedActions.length - 1];

    const pressEvent = new KeyBindingPressEvent<T>(state, action, true);

    const drawables = this.#keyRepeatInputQueue.filter(
        d => this.keyBindingInputQueue.contains(d) && d.isAlive && d.isPresent,
    );

    return drawables.find(d => this.#triggerKeyBindingEvent(d, pressEvent)) !== undefined;
  }
}

export enum SimultaneousBindingMode 
{
  None,
  Unique,
  All,
}

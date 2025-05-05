import type { Drawable } from "../graphics/drawables/Drawable";
import type { Vec2 } from "../math";
import type { List } from "../utils";
import type { UIEvent } from "./events/UIEvent";
import type { InputManager } from "./InputManager";
import type { InputState } from "./state/InputState";
import type { MouseButton } from "./state/MouseButton";
import { CustomInputManager } from "./CustomInputManager";
import { KeyDownEvent } from "./events/KeyDownEvent";
import { KeyUpEvent } from "./events/KeyUpEvent";
import { MouseDownEvent } from "./events/MouseDownEvent";
import { MouseEvent } from "./events/MouseEvent";
import { MouseMoveEvent } from "./events/MouseMoveEvent";
import { MouseUpEvent } from "./events/MouseUpEvent";
import { ScrollEvent } from "./events/ScrollEvent";
import { TouchDownEvent } from "./events/TouchDownEvent";
import { TouchMoveEvent } from "./events/TouchMoveEvent";
import { TouchUpEvent } from "./events/TouchUpEvent";
import { ButtonStates } from "./state/ButtonStates";
import { ButtonInputEntry } from "./stateChanges/ButtonInput";
import { isSourcedFromTouch } from "./stateChanges/ISourcedFromTouch";
import { KeyboardKeyInput } from "./stateChanges/KeyboardKeyInput";
import { MouseButtonInput } from "./stateChanges/MouseButtonInput";
import { MousePositionAbsoluteInput } from "./stateChanges/MousePositionAbsoluteInput";
import { MouseScrollRelativeInput } from "./stateChanges/MouseScrollRelativeInput";
import { TouchInput } from "./stateChanges/TouchInput";

export class PassThroughInputManager extends CustomInputManager 
{
  get useParentInput(): boolean 
  {
    return this.#useParentInput;
  }

  set useParentInput(value: boolean) 
  {
    if (this.#useParentInput === value)
      return;

    this.#useParentInput = value;

    if (this.useParentInput)
      this.sync();
  }

  #useParentInput: boolean = true;

  override get handleHoverEvents(): boolean 
  {
    if (this.useParentInput && this.#parentInputManager?.handleHoverEvents)
      return true;

    return super.handleHoverEvents;
  }

  override buildNonPositionalInputQueue(queue: List<Drawable>, allowBlocking: boolean = true): boolean 
  {
    if (!this.propagateNonPositionalInputSubTree)
      return false;

    if (!allowBlocking)
      return super.buildNonPositionalInputQueue(queue, allowBlocking);
    else
      queue.push(this);

    return false;
  }

  override buildPositionalInputQueue(screenSpacePos: Vec2, queue: List<Drawable>) 
  {
    if (!this.propagatePositionalInputSubTree)
      return false;

    queue.push(this);
    return false;
  }

  override getPendingInputs() 
  {
    const pendingInputs = super.getPendingInputs();

    if (this.useParentInput)
      pendingInputs.length = 0;

    return pendingInputs;
  }

  override handle(event: UIEvent): boolean 
  {
    if (!this.useParentInput)
      return false;

    if (event instanceof MouseEvent && isSourcedFromTouch(event.state.mouse.lastSource))
      return false;

    switch (event.constructor) 
    {
    case MouseMoveEvent: {
      const e = event as MouseMoveEvent;
      if (!e.screenSpaceMousePosition.equals(this.currentState.mouse.position))
        new MousePositionAbsoluteInput(e.screenSpaceMousePosition).apply(this.currentState, this);
      break;
    }
    case MouseDownEvent: {
      const e = event as MouseDownEvent;
      if (!this.currentState.mouse.isPressed(e.button))
        MouseButtonInput.create(e.button, true).apply(this.currentState, this);
      break;
    }
    case MouseUpEvent: {
      const e = event as MouseUpEvent;
      if (this.currentState.mouse.isPressed(e.button))
        MouseButtonInput.create(e.button, false).apply(this.currentState, this);
      break;
    }

    case ScrollEvent: {
      const e = event as ScrollEvent;
      new MouseScrollRelativeInput(e.scrollDelta, e.isPrecise).apply(this.currentState, this);
      break;
    }

    case TouchDownEvent:
    case TouchUpEvent:
    case TouchMoveEvent: {
      const e = event as TouchDownEvent;
      new TouchInput([e.screenSpaceTouch], e.isActive(e.screenSpaceTouch)).apply(this.currentState, this);
      break;
    }

    case KeyDownEvent: {
      const e = event as KeyDownEvent;
      if (e.repeat)
        return false;
      KeyboardKeyInput.create(e.key, true).apply(this.currentState, this);
      break;
    }
    case KeyUpEvent: {
      const e = event as KeyUpEvent;
      KeyboardKeyInput.create(e.key, false).apply(this.currentState, this);
      break;
    }
    }

    return false;
  }

  #parentInputManager: InputManager | null = null;

  override loadComplete() 
  {
    super.loadComplete();

    this.sync();
  }

  override update() 
  {
    super.update();

    if (this.useParentInput) 
    {
      this.sync(true);
    }
  }

  sync(useCachedParentInputManager = false) 
  {
    if (!this.useParentInput)
      return;

    if (!useCachedParentInputManager)
      this.#parentInputManager = this.getContainingInputManager();

    this.syncInputState(this.#parentInputManager?.currentState);
  }

  protected syncInputState(state?: InputState) 
  {
    const mouseDiff = (state?.mouse?.buttons ?? new ButtonStates<MouseButton>()).enumerateDifference(
        this.currentState.mouse.buttons,
    );
    if (mouseDiff.released.length > 0) 
    {
      new MouseButtonInput(mouseDiff.released.map(button => new ButtonInputEntry<MouseButton>(button, false))).apply(
          this.currentState,
          this,
      );
    }

    // TODO: Add the remaining events
  }

  override get requiresHighFrequencyMousePosition() 
  {
    return true;
  }
}

import type { Drawable } from '../graphics/drawables/Drawable';
import type { Vec2 } from '../math';
import type { List } from '../utils';
import type { UIEvent } from './events/UIEvent';
import type { InputManager } from './InputManager';
import type { InputState } from './state/InputState';
import type { MouseButton } from './state/MouseButton';
import { CustomInputManager } from './CustomInputManager';
import { MouseDownEvent } from './events/MouseDownEvent';
import { MouseMoveEvent } from './events/MouseMoveEvent';
import { MouseUpEvent } from './events/MouseUpEvent';
import { ButtonStates } from './state/ButtonStates';
import { ButtonInputEntry } from './stateChanges/ButtonInput';
import { MouseButtonInput } from './stateChanges/MouseButtonInput';
import { MousePositionAbsoluteInput } from './stateChanges/MousePositionAbsoluteInput';

export class PassThroughInputManager extends CustomInputManager {
  get useParentInput(): boolean {
    return this.#useParentInput;
  }

  set useParentInput(value: boolean) {
    if (this.#useParentInput === value)
      return;

    this.#useParentInput = value;

    if (this.useParentInput)
      this.sync();
  }

  #useParentInput: boolean = true;

  override get handleHoverEvents(): boolean {
    if (this.useParentInput && this.#parentInputManager?.handleHoverEvents)
      return true;

    return super.handleHoverEvents;
  }

  override buildPositionalInputQueue(screenSpacePos: Vec2, queue: List<Drawable>) {
    if (!this.propagatePositionalInputSubTree)
      return false;

    queue.push(this);
    return false;
  }

  override getPendingInputs() {
    const pendingInputs = super.getPendingInputs();

    if (this.useParentInput) {
      pendingInputs.length = 0;
    }

    return pendingInputs;
  }

  override handle(event: UIEvent): boolean {
    if (!this.useParentInput)
      return false;

    switch (event.constructor) {
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
      // TODO: ScrollEvent
      // TODO: TouchEvent
      // TODO: KeyboardEvent
    }

    return false;
  }

  #parentInputManager: InputManager | null = null;

  override loadComplete() {
    super.loadComplete();

    this.sync();
  }

  override update() {
    super.update();

    if (this.useParentInput) {
      this.sync(true);
    }
  }

  sync(useCachedParentInputManager = false) {
    if (!this.useParentInput)
      return;

    if (!useCachedParentInputManager)
      this.#parentInputManager = this.getContainingInputManager();

    this.syncInputState(this.#parentInputManager?.currentState);
  }

  protected syncInputState(state?: InputState) {
    const mouseDiff = (state?.mouse?.buttons ?? new ButtonStates<MouseButton>()).enumerateDifference(
      this.currentState.mouse.buttons,
    );
    if (mouseDiff.released.length > 0) {
      new MouseButtonInput(mouseDiff.released.map(button => new ButtonInputEntry<MouseButton>(button, false))).apply(
        this.currentState,
        this,
      );
    }

    // TODO: Add the remaining events
  }

  override get requiresHighFrequencyMousePosition() {
    return true;
  }
}

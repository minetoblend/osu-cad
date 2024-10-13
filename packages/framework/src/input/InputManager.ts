import type { Drawable } from '../graphics/drawables/Drawable';
import type { GameHost } from '../platform/GameHost';
import type { UIEvent } from './events/UIEvent';
import type { InputHandler } from './handlers/InputHandler';
import type { TouchSource } from './handlers/Touch';
import type { IFocusManager } from './IFocusManager';
import type { InputStateChangeEvent } from './stateChanges/events/InputStateChangeEvent';
import type { IInput } from './stateChanges/IInput';
import type { IInputStateChangeHandler } from './stateChanges/IInputStateChangeHandler';
import { Action } from '../bindables';
import { resolved } from '../di/decorators';
import { Container } from '../graphics/containers/Container';
import { Axes } from '../graphics/drawables/Axes';
import { GAME_HOST } from '../injectionTokens';
import { Vec2 } from '../math';
import { FrameStatistics } from '../statistics/FrameStatistics';
import { StatisticsCounterType } from '../statistics/StatisticsCounterType';
import { debugAssert } from '../utils/debugAssert';
import { List } from '../utils/List';
import { DropEvent } from './events/DropEvent';
import { FocusEvent } from './events/FocusEvent';
import { FocusLostEvent } from './events/FocusLostEvent';
import { HoverEvent } from './events/HoverEvent';
import { HoverLostEvent } from './events/HoverLostEvent';
import { MouseMoveEvent } from './events/MouseMoveEvent';
import { ScrollEvent } from './events/ScrollEvent';
import { KeyboardHandler } from './handlers/KeyboardHandler.ts';
import { KeyEventManager } from './KeyEventManager';
import { MouseButtonEventManager } from './MouseButtonEventManager';
import { InputState } from './state/InputState';
import { Key } from './state/Key';
import { MouseButton } from './state/MouseButton';
import { ButtonStateChangeEvent } from './stateChanges/events/ButtonStateChangeEvent';
import { ButtonStateChangeKind } from './stateChanges/events/ButtonStateChangeKind';
import { DropStateChangeEvent } from './stateChanges/events/DropStateChangeEvent';
import { MousePositionChangeEvent } from './stateChanges/events/MousePositionChangeEvent';
import { MouseScrollChangeEvent } from './stateChanges/events/MouseScrollChangeEvent';
import { TouchStateChangeEvent } from './stateChanges/events/TouchStateChangeEvent';
import { KeyboardKeyInput } from './stateChanges/KeyboardKeyInput';
import { MouseButtonInput } from './stateChanges/MouseButtonInput';
import { MouseButtonInputFromTouch } from './stateChanges/MouseButtonInputFromTouch';
import { MousePositionAbsoluteInputFromTouch } from './stateChanges/MousePositionAbsoluteInputFromTouch';
import { TouchEventManager } from './TouchEventManager';

const repeat_tick_rate = 70;
const repeat_initial_delay = 250;

export abstract class InputManager extends Container implements IInputStateChangeHandler, IFocusManager {
  currentState = new InputState();

  abstract inputHandlers: ReadonlyArray<InputHandler>;

  #keyboardRepeatTime = 0;
  #keyboardRepeatKey: Key | null = null;

  readonly isFocusManger = true;

  constructor() {
    super();

    this.relativeSizeAxes = Axes.Both;

    for (const mouseButton of [MouseButton.Left, MouseButton.Middle, MouseButton.Right]) {
      const manager = this.createMouseButtonEventManager(mouseButton);

      manager.inputManager = this;
      manager.getInputQueue = () => this.positionalInputQueue;

      this.#mouseButtonEventManagers[mouseButton] = manager;
    }
  }

  createMouseButtonEventManager(button: MouseButton) {
    if (button === MouseButton.Left) {
      return new MouseLeftButtonEventManager(button);
    }

    return new MouseMinorButtonEventManager(button);
  }

  getMouseButtonEventManagerFor(button: MouseButton) {
    return this.#mouseButtonEventManagers[button];
  }

  #keyButtonEventManagers: Record<Key, KeyEventManager> = {} as any;

  getKeyEventManagerFor(key: Key): KeyEventManager {
    if (!this.#keyButtonEventManagers[key]) {
      const manager = this.createKeyEventManagerFor(key);

      manager.inputManager = this;
      manager.getInputQueue = () => this.nonPositionalInputQueue;

      this.#keyButtonEventManagers[key] = manager;
    }

    return this.#keyButtonEventManagers[key];
  }

  protected createKeyEventManagerFor(key: Key) {
    return new KeyEventManager(key);
  }

  @resolved(GAME_HOST)
  host!: GameHost;

  focusedDrawable: Drawable | null = null;

  override onLoad() {
    super.onLoad();

    for (const handler of this.inputHandlers) {
      handler.initialize(this.host);

      if (handler instanceof KeyboardHandler) {
        handler.onInput.addListener(this.update, this);
      }
    }
  }

  isInputManager = true;

  override update(): void {
    this.#unfocusIfNoLongerValid();
    this.#inputQueue.clear();
    this.#positionalInputQueue.clear();

    this.#hoverEventsUpdated = false;

    const pendingInputs = this.getPendingInputs();

    if (pendingInputs.length > 0) {
      this.#lastMouseMove = null;
    }

    for (const result of pendingInputs) {
      result.apply(this.currentState, this);
    }

    if (this.currentState.mouse.isPositionValid) {
      debugAssert(this.highFrequencyDrawables.length === 0);
      for (const d of this.positionalInputQueue) {
        if (d.requiresHighFrequencyMousePosition)
          this.highFrequencyDrawables.push(d);
      }

      if (this.highFrequencyDrawables.length > 0) {
        this.#lastMouseMove ??= new MouseMoveEvent(this.currentState);
        this.propagateBlockableEvent(this.highFrequencyDrawables, this.#lastMouseMove);
      }

      this.highFrequencyDrawables.length = 0;
    }

    this.#updateKeyRepeat(this.currentState);

    if (!this.#hoverEventsUpdated) {
      this.#updateHoverEvents(this.currentState);
    }

    if (this.focusedDrawable === null) {
      this.#focusTopMostRequestingDrawable();
    }

    super.update();
  }

  changeFocus(potentialFocusTarget: Drawable | null, state: InputState = this.currentState): boolean {
    if (potentialFocusTarget === this.focusedDrawable)
      return true;

    if (
      potentialFocusTarget !== null
      && (!this.#isDrawableValidForFocus(potentialFocusTarget) || !potentialFocusTarget.acceptsFocus)
    ) {
      return false;
    }

    const previousFocus = this.focusedDrawable;

    this.focusedDrawable = null;

    if (previousFocus !== null) {
      previousFocus.hasFocus = false;
      previousFocus.triggerEvent(new FocusLostEvent(state, potentialFocusTarget));

      if (this.focusedDrawable !== null) {
        throw new Error('Focus cannot be changed inside OnFocusLost.');
      }
    }

    this.focusedDrawable = potentialFocusTarget;

    if (this.focusedDrawable !== null) {
      this.focusedDrawable.hasFocus = true;
      this.focusedDrawable.triggerEvent(new FocusEvent(state, previousFocus));
    }

    return true;
  }

  #isDrawableValidForFocus(drawable: Drawable): boolean {
    let valid = drawable.isAlive && drawable.isPresent && drawable.parent !== null;

    if (valid) {
      // ensure we are visible
      let d = drawable.parent;

      while (d !== null) {
        if (!d.isPresent || !d.isAlive) {
          valid = false;
          break;
        }

        d = d.parent;
      }
    }

    return valid;
  }

  #updateKeyRepeat(state: InputState) {
    if (!this.#keyboardRepeatKey)
      return;

    this.#keyboardRepeatTime -= this.time.elapsed;

    while (this.#keyboardRepeatTime < 0) {
      this.getKeyEventManagerFor(this.#keyboardRepeatKey!).handleRepeat(state);
      this.#keyboardRepeatTime += repeat_tick_rate;
    }
  }

  getPendingInputs(): IInput[] {
    const inputs: IInput[] = [];
    for (const h of this.inputHandlers) {
      h.collectPendingInputs(inputs);
    }
    return inputs;
  }

  handleInputStateChange(event: InputStateChangeEvent): void {
    if (event instanceof MousePositionChangeEvent) {
      this.handleMousePositionChange(event as MousePositionChangeEvent);
      return;
    }

    if (event instanceof ButtonStateChangeEvent) {
      const buttonEvent = event as ButtonStateChangeEvent<any>;
      if (buttonEvent.input instanceof MouseButtonInput) {
        this.handleMouseButtonStateChange(buttonEvent as ButtonStateChangeEvent<MouseButton>);
      }
      else if (buttonEvent.input instanceof KeyboardKeyInput) {
        this.handleKeyboardKeyStateChange(buttonEvent as ButtonStateChangeEvent<Key>);
      }
      return;
    }

    if (event instanceof MouseScrollChangeEvent) {
      this.handleMouseScrollChange(event as MouseScrollChangeEvent);
      return;
    }

    if (event instanceof TouchStateChangeEvent) {
      const touchChange = event as TouchStateChangeEvent;
      const manager = this.getTouchButtonEventManagerFor(touchChange.touch.source);

      const touchWasHandled = manager.heldDrawable !== null;
      this.handleTouchStateChange(touchChange);

      const touchIsHandled = manager.heldDrawable !== null;

      if (!touchWasHandled && !touchIsHandled)
        this.handleMouseTouchStateChange(touchChange);
      return;
    }

    if (event instanceof DropStateChangeEvent) {
      const dropEvent = event as DropStateChangeEvent;

      this.propagateBlockableEvent(this.positionalInputQueue, new DropEvent(dropEvent.state, dropEvent.files));
      this.currentState.draggedFiles = null;
    }
  }

  handleMousePositionChange(event: MousePositionChangeEvent): void {
    const state = event.state;

    this.#handleMouseMove(state, event.lastPosition);

    for (const manager of Object.values(this.#mouseButtonEventManagers))
      manager.handlePositionChange(state, event.lastPosition);

    this.#updateHoverEvents(state);
  }

  #handleMouseMove(state: InputState, lastPosition: Vec2): void {
    this.propagateBlockableEvent(
      this.positionalInputQueue,
      (this.#lastMouseMove = new MouseMoveEvent(state, lastPosition)),
    );
  }

  handleMouseScrollChange(e: MouseScrollChangeEvent): void {
    this.#handleScroll(e.state, e.lastScroll, e.isPrecise);
  }

  #handleScroll(state: InputState, lastScroll: Vec2, isPrecise: boolean): void {
    this.propagateBlockableEvent(
      this.positionalInputQueue,
      new ScrollEvent(state, state.mouse.scroll.sub(lastScroll), isPrecise),
    );
  }

  #hoverHandledDrawable: Drawable | null = null;
  #hoveredDrawables: Drawable[] = [];
  #lastHoverHandledDrawables: Drawable[] = [];

  get handleHoverEvents() {
    return true;
  }

  #updateHoverEvents(state: InputState) {
    const lastHoverHandledDrawable = this.#hoverHandledDrawable;
    this.#hoverHandledDrawable = null;

    this.#lastHoverHandledDrawables = [...this.#hoveredDrawables];

    this.#hoveredDrawables = [];

    if (this.handleHoverEvents) {
      for (const d of this.positionalInputQueue) {
        this.#hoveredDrawables.push(d);
        const index = this.#lastHoverHandledDrawables.indexOf(d);
        if (index !== -1) {
          this.#lastHoverHandledDrawables.splice(index, 1);
        }

        if (d.isHovered) {
          if (d === lastHoverHandledDrawable) {
            this.#hoverHandledDrawable = lastHoverHandledDrawable;
            break;
          }

          continue;
        }

        d.isHovered = true;

        if (d.triggerEvent(new HoverEvent(state))) {
          this.#hoverHandledDrawable = d;
          break;
        }
      }
    }

    // Unhover all previously hovered drawables which are no longer hovered.
    for (const d of this.#lastHoverHandledDrawables) {
      d.isHovered = false;
      d.triggerEvent(new HoverLostEvent(state));
    }

    this.#hoverEventsUpdated = true;
  }

  handleMouseButtonStateChange(event: ButtonStateChangeEvent<MouseButton>) {
    const handler = this.#mouseButtonEventManagers[event.button];
    handler?.handleButtonStateChange(this.currentState, event.kind);
  }

  handleKeyboardKeyStateChange(keyboardKeyStateChange: ButtonStateChangeEvent<Key>) {
    const state = keyboardKeyStateChange.state;
    const key = keyboardKeyStateChange.button;
    const kind = keyboardKeyStateChange.kind;

    this.getKeyEventManagerFor(key).handleButtonStateChange(state, kind);

    if (kind === ButtonStateChangeKind.Pressed) {
      if (!this.#isModifierKey(key)) {
        this.#keyboardRepeatKey = key;
        this.#keyboardRepeatTime = repeat_initial_delay;
      }
    }
    else {
      if (key === this.#keyboardRepeatKey) {
        this.#keyboardRepeatKey = null;
        this.#keyboardRepeatTime = 0;
      }
    }
  }

  #isModifierKey(key: Key) {
    return (
      key === Key.ShiftLeft
      || key === Key.ShiftRight
      || key === Key.ControlLeft
      || key === Key.ControlRight
      || key === Key.AltLeft
      || key === Key.AltRight
      || key === Key.MetaLeft
      || key === Key.MetaRight
    );
  }

  #mouseButtonEventManagers: Record<MouseButton, MouseButtonEventManager> = {} as any;

  #lastMouseMove: MouseMoveEvent | null = null;
  #hoverEventsUpdated = false;

  #inputQueue = new List<Drawable>(250);
  #positionalInputQueue = new List<Drawable>(20);

  get positionalInputQueue(): List<Drawable> {
    if (this.#positionalInputQueue.length > 0)
      return this.#positionalInputQueue;

    return this.#buildPositionalInputQueue(this.currentState.mouse.position);
  }

  get nonPositionalInputQueue(): List<Drawable> {
    return this.#buildNonPositionalInputQueue();
  }

  #buildPositionalInputQueue(screenSpacePos: Vec2): List<Drawable> {
    this.#positionalInputQueue.clear();

    if (this.name === 'UserInputManager') {
      FrameStatistics.increment(StatisticsCounterType.PositionalIQ);
    }

    const children = this.internalChildren;
    const start = performance.now();

    for (let i = 0; i < children.length; i++) {
      if (this.shouldBeConsideredForInput(children[i])) {
        children[i].buildPositionalInputQueue(screenSpacePos, this.#positionalInputQueue);
      }
    }

    if (this.name === 'UserInputManager') {
      FrameStatistics.inputQueue = performance.now() - start;
    }

    this.#positionalInputQueue.reverse();

    return this.#positionalInputQueue;
  }

  #buildNonPositionalInputQueue(): List<Drawable> {
    this.#inputQueue.clear();

    if (this.name === 'UserInputManager') {
      FrameStatistics.increment(StatisticsCounterType.InputQueue);
    }

    const children = this.aliveInternalChildren;

    for (let i = 0; i < children.length; i++) {
      if (this.shouldBeConsideredForInput(children[i])) {
        children[i].buildNonPositionalInputQueue(this.#inputQueue);
      }
    }

    if (!this.#unfocusIfNoLongerValid()) {
      const index = this.#inputQueue.indexOf(this.focusedDrawable!);
      if (index !== -1 && index !== this.#inputQueue.length - 1) {
        this.#inputQueue.splice(index, 1);
        this.#inputQueue.push(this.focusedDrawable!);
      }
    }

    this.#inputQueue.reverse();

    return this.#inputQueue;
  }

  override buildPositionalInputQueue(screenSpacePos: Vec2, queue: List<Drawable>): boolean {
    return false;
  }

  override buildNonPositionalInputQueue(queue: List<Drawable>, allowBlocking: boolean = true) {
    if (!allowBlocking)
      super.buildNonPositionalInputQueue(queue, false);

    return false;
  }

  private readonly highFrequencyDrawables: Drawable[] = [];

  propagateBlockableEvent(drawables: Iterable<Drawable>, e: UIEvent): boolean {
    for (const d of drawables) {
      if (!d.triggerEvent(e))
        continue;

      return true;
    }

    return false;
  }

  #unfocusIfNoLongerValid() {
    if (this.focusedDrawable === null) {
      return true;
    }

    if (this.#isDrawableValidForFocus(this.focusedDrawable)) {
      return false;
    }

    this.changeFocus(null);
    return true;
  }

  #focusTopMostRequestingDrawable() {
    for (const d of this.nonPositionalInputQueue) {
      if (d.requestsFocus) {
        this.changeFocus(d);
        return;
      }
    }

    this.changeFocus(null);
  }

  changeFocusFromClick(clickedDrawable: Drawable | null) {
    let focusTarget: Drawable | null = null;
    if (clickedDrawable !== null) {
      focusTarget = clickedDrawable;

      if (!focusTarget.acceptsFocus) {
        // search upwards from the clicked drawable until we find something to handle focus.
        const previousFocused = this.focusedDrawable;

        while (focusTarget?.acceptsFocus === false) {
          focusTarget = focusTarget.parent;
        }

        if (focusTarget !== null && previousFocused !== null) {
          // we found a focusable target above us.
          // now search upwards from previousFocused to check whether focusTarget is a common parent.
          let search: Drawable | null = previousFocused;
          while (search !== null && search !== focusTarget) {
            search = search.parent;
          }

          if (focusTarget === search)
            // we have a common parent, so let's keep focus on the previously focused target.
            focusTarget = previousFocused;
        }
      }
    }

    this.changeFocus(focusTarget);
  }

  #touchEventManagers: Record<TouchSource, TouchEventManager> = {} as any;

  getTouchButtonEventManagerFor(source: TouchSource) {
    const existing = this.#touchEventManagers[source];
    if (existing !== undefined)
      return existing;

    const manager = this.createTouchEventManagerFor(source);
    manager.inputManager = this;
    manager.getInputQueue = () => this.#buildPositionalInputQueue(this.currentState.touch.touchPositions[source]!);
    return (this.#touchEventManagers[source] = manager);
  }

  protected createTouchEventManagerFor(source: TouchSource) {
    return new TouchEventManager(source);
  }

  protected handleTouchStateChange(e: TouchStateChangeEvent) {
    const manager = this.getTouchButtonEventManagerFor(e.touch.source);

    if (e.lastPosition !== null) {
      manager.handlePositionChange(e.state, e.lastPosition);
    }

    if (e.isActive !== null) {
      manager.handleButtonStateChange(
        e.state,
        e.isActive ? ButtonStateChangeKind.Pressed : ButtonStateChangeKind.Released,
      );
    }
  }

  protected mapMouseToLatestTouch(): boolean {
    return true;
  }

  get allowRightClickFromLongTouch(): boolean {
    return true;
  }

  readonly #mouseMappedTouchesDown = new Set<TouchSource>();

  readonly touchLongPressBegan = new Action<[Vec2, number]>();

  readonly touchLongPressCancelled = new Action();

  #touchLongPressTimeout: ReturnType<typeof setTimeout> | null = null;

  #touchLongPressPosition: Vec2 | null = null;

  #validForLongPress = false;

  protected handleMouseTouchStateChange(e: TouchStateChangeEvent): boolean {
    if (!this.mapMouseToLatestTouch)
      return false;

    if (e.isActive === true || e.lastPosition !== null) {
      new MousePositionAbsoluteInputFromTouch(e, e.touch.position).apply(this.currentState, this);
    }

    if (e.isActive !== null) {
      if (e.isActive === true) {
        this.#mouseMappedTouchesDown.add(e.touch.source);
      }
      else {
        this.#mouseMappedTouchesDown.delete(e.touch.source);
      }

      this.#updateTouchMouseLeft(e);
    }

    this.#updateTouchMouseRight(e);
    return true;
  }

  #updateTouchMouseLeft(e: TouchStateChangeEvent) {
    if (this.#mouseMappedTouchesDown.size > 0) {
      new MouseButtonInputFromTouch(MouseButton.Left, true, e).apply(this.currentState, this);
    }
    else {
      new MouseButtonInputFromTouch(MouseButton.Left, false, e).apply(this.currentState, this);
    }
  }

  #updateTouchMouseRight(e: TouchStateChangeEvent) {
    if (!this.allowRightClickFromLongTouch)
      return;

    // if a touch was pressed/released in this event, reset gesture validity state.
    if (e.isActive !== null)
      this.#validForLongPress = e.isActive === true && this.#mouseMappedTouchesDown.size === 1;

    const gestureActive = this.#touchLongPressTimeout !== null;

    if (gestureActive) {
      debugAssert(this.#touchLongPressPosition !== null);

      // if a gesture was active and the user moved away from actuation point, invalidate gesture.
      if (Vec2.distance(this.#touchLongPressPosition!, e.touch.position) > touch_right_click_distance)
        this.#validForLongPress = false;

      if (!this.#validForLongPress)
        this.#cancelTouchLongPress();
    }
    else {
      if (this.#validForLongPress)
        this.#beginTouchLongPress(e);
    }
  }

  #beginTouchLongPress(e: TouchStateChangeEvent) {
    this.#touchLongPressPosition = e.touch.position;

    this.touchLongPressBegan.emit([e.touch.position, touch_right_click_delay]);
    this.#touchLongPressTimeout = setTimeout(() => {
      new MousePositionAbsoluteInputFromTouch(e, e.touch.position).apply(this.currentState, this);
      new MouseButtonInputFromTouch(MouseButton.Right, true, e).apply(this.currentState, this);
      new MouseButtonInputFromTouch(MouseButton.Right, false, e).apply(this.currentState, this);

      // the touch actuated a long-press, releasing it should not perform a click.
      this.getMouseButtonEventManagerFor(MouseButton.Left).blockNextClick = true;

      this.#touchLongPressTimeout = null;
      this.#validForLongPress = false;
    }, touch_right_click_delay);
  }

  #cancelTouchLongPress() {
    debugAssert(this.#touchLongPressTimeout !== null);

    this.#touchLongPressPosition = null;

    clearTimeout(this.#touchLongPressTimeout!);

    this.#touchLongPressTimeout = null;

    this.touchLongPressCancelled.emit();
  }
}

const touch_right_click_delay = 750;
const touch_right_click_distance = 100;

class MouseLeftButtonEventManager extends MouseButtonEventManager {
  override get enableClick(): boolean {
    return true;
  }

  override get enableDrag(): boolean {
    return true;
  }

  override get changeFocusOnClick(): boolean {
    return true;
  }
}

class MouseMinorButtonEventManager extends MouseButtonEventManager {
  override get enableClick(): boolean {
    return false;
  }

  override get enableDrag(): boolean {
    return false;
  }

  override get changeFocusOnClick(): boolean {
    return false;
  }
}

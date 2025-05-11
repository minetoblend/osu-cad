import type { KeyBindingAction, SimultaneousBindingMode, KeyBindingContainer, IInput, IInputStateChangeHandler } from "@osucad/framework";
import { Axes, Container, InputState, InputStateChangeEvent, PassThroughInputManager } from "@osucad/framework";
import type { Ruleset } from "../Ruleset";

export abstract class RulesetInputManager<T extends KeyBindingAction> extends PassThroughInputManager
{
  override get allowRightClickFromLongTouch(): boolean
  {
    return false;
  }

  public keyBindingContainer: KeyBindingContainer<T>;

  protected override createInitialState(): InputState
  {
    return new RulesetInputManagerInputState(super.createInitialState());
  }

  override get content(): Container
  {
    return this.#content;
  }

  #content!: Container;

  protected constructor(ruleset: Ruleset, unique: SimultaneousBindingMode)
  {
    super();

    this.internalChild = this.keyBindingContainer = this.createKeyBindingContainer(ruleset, unique)
      .with({
        child: this.#content = new Container({ relativeSizeAxes: Axes.Both }),
      });
  }

  protected abstract createKeyBindingContainer(ruleset: Ruleset, unique: SimultaneousBindingMode): KeyBindingContainer<T>;

  override handleInputStateChange(event: InputStateChangeEvent)
  {
    if (event instanceof ReplayStateChangeEvent)
    {
      for (const action of event.releasedActions)
        this.keyBindingContainer.triggerReleased(action);
      for (const action of event.pressedActions)
        this.keyBindingContainer.triggerPressed(action);
      return;
    }

    super.handleInputStateChange(event);
  }
}

class RulesetInputManagerInputState<T extends KeyBindingAction> extends InputState
{
  lastReplayState: ReplayState<T> | null = null;

  constructor(state: InputState)
  {
    super(state);
  }
}

export class ReplayState<T extends KeyBindingAction> implements IInput
{
  constructor(
    readonly pressedActions: readonly T[],
  )
  {
  }

  apply(state: InputState, handler: IInputStateChangeHandler)
  {
    if (!(state instanceof RulesetInputManagerInputState))
      throw new Error("ReplayState should only be applied to a RulesetInputManagerInputState");

    let released = new Set<T>();
    let pressed = new Set<T>();

    const lastPressed = state.lastReplayState?.pressedActions ?? null;

    if (lastPressed === null || lastPressed.length === 0)
    {
      pressed = new Set(this.pressedActions);
    }
    else if (this.pressedActions.length === 0)
    {
      released = new Set(lastPressed);
    }
    else if (!sequenceEquals(lastPressed, this.pressedActions))
    {
      released = new Set(lastPressed).difference(new Set(this.pressedActions));
      pressed = new Set(this.pressedActions).difference(new Set(lastPressed));
    }

    (state as RulesetInputManagerInputState<T>).lastReplayState = this;

    handler.handleInputStateChange(new ReplayStateChangeEvent(state, this, [...pressed], [...released]));
  }
}

export class ReplayStateChangeEvent<T extends KeyBindingAction> extends InputStateChangeEvent
{
  constructor(state: InputState, input: IInput, readonly pressedActions: readonly T[], readonly  releasedActions: readonly T[])
  {
    super(state, input);
  }
}

function sequenceEquals<T>(a: readonly T[], b: readonly T[], equals: ((a: T, b: T) => boolean) = defaultEquals)
{
  if (a.length !== b.length)
    return false;

  for (let i = 0; i < a.length; i++)
  {
    if (!equals(a[i], b[i]))
      return false;
  }

  return true;
}

function defaultEquals<T>(a: T, b: T)
{
  return a === b;
}

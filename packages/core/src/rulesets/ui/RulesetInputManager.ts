import type { KeyBindingAction, SimultaneousBindingMode , KeyBindingContainer } from "@osucad/framework";
import { Axes, Container, InputState, PassThroughInputManager } from "@osucad/framework";
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
}

class RulesetInputManagerInputState<T> extends InputState
{
  constructor(state: InputState)
  {
    super(state);
  }
}

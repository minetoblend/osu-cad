import type { Ruleset } from "@osucad/core";
import { RulesetInputManager } from "@osucad/core";
import { OsuAction } from "./OsuAction";
import type { IKeyBinding } from "@osucad/framework";
import { InputKey, KeyBinding, KeyBindingContainer, SimultaneousBindingMode } from "@osucad/framework";

export class OsuInputManager extends RulesetInputManager<OsuAction>
{

  constructor(ruleset: Ruleset)
  {
    super(ruleset, SimultaneousBindingMode.Unique);
  }

  get pressedActions()
  {
    return this.keyBindingContainer.pressedActions as readonly OsuAction[];
  }

  protected override createKeyBindingContainer(ruleset: Ruleset, unique: SimultaneousBindingMode): KeyBindingContainer<OsuAction>
  {
    return new OsuKeybindingContainer(unique);
  }
}

class OsuKeybindingContainer extends KeyBindingContainer<OsuAction>
{
  constructor(unique: SimultaneousBindingMode)
  {
    super(unique);
  }

  override get defaultKeyBindings(): IKeyBinding[]
  {
    return [
      // KeyBinding.from(InputKey.MouseLeftButton, OsuAction.LeftButton),
      // KeyBinding.from(InputKey.MouseRightButton, OsuAction.RightButton),
      KeyBinding.from(InputKey.X, OsuAction.LeftButton),
      KeyBinding.from(InputKey.C, OsuAction.RightButton),
      KeyBinding.from(InputKey.V, OsuAction.RightButton),
    ];
  }
}

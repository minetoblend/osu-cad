import type { IKeyBinding } from '@osucad/framework';
import { InputKey, KeyBinding, KeyBindingContainer, KeyCombination, SimultaneousBindingMode } from '@osucad/framework';
import { OsuAction } from './OsuAction';

export class OsuActionInputManager extends KeyBindingContainer<OsuAction> {
  constructor() {
    super(SimultaneousBindingMode.All);
  }

  get defaultKeyBindings(): IKeyBinding[] {
    return [
      new KeyBinding(KeyCombination.from(InputKey.C), OsuAction.LeftButton),
      new KeyBinding(KeyCombination.from(InputKey.B), OsuAction.LeftButton),
    ];
  }
}

import type { IKeyBinding, KeyBindingAction, SimultaneousBindingMode } from 'osucad-framework';
import type { Ruleset } from '../Ruleset';
import { KeyBindingContainer } from 'osucad-framework';

export class RulesetKeyBindingContainer<T extends KeyBindingAction> extends KeyBindingContainer<T> {
  constructor(readonly ruleset: Ruleset, unique: SimultaneousBindingMode) {
    super(unique);
  }

  override get defaultKeyBindings(): IKeyBinding[] {
    return this.ruleset.getDefaultKeyBindings();
  }
}

import type { IKeyBinding, KeyBindingAction, SimultaneousBindingMode } from '@osucad/framework';
import type { RulesetInfo } from '../RulesetInfo';
import { KeyBindingContainer } from '@osucad/framework';

export class RulesetKeyBindingContainer<T extends KeyBindingAction> extends KeyBindingContainer<T> {
  constructor(readonly ruleset: RulesetInfo, readonly variant: number, unique: SimultaneousBindingMode) {
    super(unique);
  }

  override get handleRepeats(): boolean {
    return false;
  }

  override get defaultKeyBindings(): IKeyBinding[] {
    return this.ruleset.createInstance().getDefaultKeyBindings();
  }
}

import type { Ruleset } from '../Ruleset';
import type { OsuAction } from './OsuAction';
import { SimultaneousBindingMode } from 'osucad-framework';
import { RulesetInputManager } from '../ui/RulesetInputManager';

export class OsuInputManager extends RulesetInputManager<OsuAction> {
  constructor(ruleset: Ruleset) {
    super(ruleset, SimultaneousBindingMode.Unique);
  }
}

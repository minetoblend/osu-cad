import type { RulesetInfo } from '../RulesetInfo';
import type { OsuAction } from './OsuAction';
import { SimultaneousBindingMode } from 'osucad-framework';
import { RulesetInputManager } from '../ui/RulesetInputManager';

export class OsuInputManager extends RulesetInputManager<OsuAction> {
  constructor(ruleset: RulesetInfo) {
    super(ruleset, 0, SimultaneousBindingMode.Unique);
  }
}

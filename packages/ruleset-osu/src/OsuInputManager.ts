import type { RulesetInfo } from '@osucad/common';
import type { OsuAction } from './OsuAction';
import { RulesetInputManager } from '@osucad/common';
import { SimultaneousBindingMode } from 'osucad-framework';

export class OsuInputManager extends RulesetInputManager<OsuAction> {
  constructor(ruleset: RulesetInfo) {
    super(ruleset, 0, SimultaneousBindingMode.Unique);
  }
}

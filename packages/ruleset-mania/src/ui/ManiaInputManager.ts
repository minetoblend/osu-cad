import type { RulesetInfo } from '@osucad/core';
import type { ManiaAction } from './ManiaAction';
import { RulesetInputManager } from '@osucad/core';
import { SimultaneousBindingMode } from '@osucad/framework';

export class ManiaInputManager extends RulesetInputManager<ManiaAction> {
  constructor(ruleset: RulesetInfo, variant: number) {
    super(ruleset, variant, SimultaneousBindingMode.Unique);
  }
}

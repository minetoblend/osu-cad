import type { RulesetInfo } from '@osucad/common';
import type { ManiaAction } from './ManiaAction';
import { RulesetInputManager } from '@osucad/common';
import { SimultaneousBindingMode } from 'osucad-framework';

export class ManiaInputManager extends RulesetInputManager<ManiaAction> {
  constructor(ruleset: RulesetInfo, variant: number) {
    super(ruleset, variant, SimultaneousBindingMode.Unique);
  }
}

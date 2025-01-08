import type { RulesetInfo } from './RulesetInfo';

export class RulesetStore {
  static readonly #legacyRulesets = new Map<number, RulesetInfo>();

  static readonly #rulesets = new Map<string, RulesetInfo>();

  static register(rulesetInfo: RulesetInfo) {
    const ruleset = rulesetInfo.createInstance();

    this.#rulesets.set(ruleset.shortName, rulesetInfo);
    if (ruleset.legacyId !== null) {
      this.#legacyRulesets.set(ruleset.legacyId, rulesetInfo);
    }
  }

  static getByLegacyId(legacyId: number) {
    return this.#legacyRulesets.get(legacyId) ?? null;
  }
}

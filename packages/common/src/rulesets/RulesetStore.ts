import type { Ruleset } from './Ruleset';

export class RulesetStore {
  static readonly #legacyRulesets = new Map<number, Ruleset>();

  static register(ruleset: Ruleset, legacyId?: number) {
    if (legacyId !== undefined)
      this.#legacyRulesets.set(legacyId, ruleset);
  }

  static getRuleset(legacyId: number) {
    return this.#legacyRulesets.get(legacyId) ?? null;
  }
}

import type { Ruleset } from './Ruleset';

export class RulesetStore {
  readonly #legacyRulesets = new Map<number, Ruleset>();

  register(ruleset: Ruleset, legacyId?: number) {
    if (legacyId !== undefined)
      this.#legacyRulesets.set(legacyId, ruleset);
  }

  getRuleset(legacyId: number) {
    return this.#legacyRulesets.get(legacyId) ?? null;
  }
}

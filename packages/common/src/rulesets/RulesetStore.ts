import type { HitObject } from '../hitObjects/HitObject';
import type { NoArgsConstructor } from '../utils/Constructor';
import type { RulesetInfo } from './RulesetInfo';

export class RulesetStore {
  static readonly #legacyRulesets = new Map<number, RulesetInfo>();

  static readonly #rulesets = new Map<string, RulesetInfo>();

  static HIT_OBJECT_CLASSES: Record<string, NoArgsConstructor<HitObject>> = {};

  static register(rulesetInfo: RulesetInfo) {
    const ruleset = rulesetInfo.createInstance();

    this.#rulesets.set(ruleset.shortName, rulesetInfo);
    if (ruleset.legacyId !== null) {
      this.#legacyRulesets.set(ruleset.legacyId, rulesetInfo);
    }

    const hitObjectClasses = ruleset.getHitObjectClasses();

    Object.assign(this.HIT_OBJECT_CLASSES, hitObjectClasses);

    for (const [name, ctor] of Object.entries(hitObjectClasses)) {
      (ctor as any).__typeName__ = name;
    }
  }

  static getByLegacyId(legacyId: number) {
    return this.#legacyRulesets.get(legacyId) ?? null;
  }
}

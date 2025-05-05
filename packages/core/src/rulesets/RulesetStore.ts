import type { Ruleset } from "./Ruleset";

export class RulesetStore 
{
  private readonly _rulesets: Ruleset[] = [];

  register(ruleset: Ruleset) 
  {
    if (this.get({ id: ruleset.id })) 
    {
      console.warn(`A ruleset with id ${ruleset.id} has already been registered.`);
      return false;
    }

    this._rulesets.push(ruleset);
    return true;
  }

  get(lookup: RulesetLookup): Ruleset | undefined 
  {
    if ("id" in lookup)
      return this._rulesets.find(it => it.id === lookup.id);
    if ("legacyId" in lookup)
      return this._rulesets.find(it => it.legacyId === lookup.legacyId);
    return undefined;
  }

}

export type RulesetLookup =
    | { id: string }
    | { legacyId: number };

export const rulesets = new RulesetStore();


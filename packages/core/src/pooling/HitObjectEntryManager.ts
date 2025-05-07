import { Action } from "@osucad/framework";
import type { HitObject, HitObjectLifetimeEntry } from "../rulesets";
import { SyntheticHitObjectEntry } from "../rulesets";

export class HitObjectEntryManager
{
  public get allEntries()
  {
    return this.#entryMap.values();
  }

  readonly onEntryAdded = new Action<HitObjectEntryManagerEvent>();

  readonly onEntryRemoved = new Action<HitObjectEntryManagerEvent>();

  readonly #entryMap = new Map<HitObject, HitObjectLifetimeEntry>();

  readonly #parentMap = new Map<HitObjectLifetimeEntry, HitObject>();

  public add(entry: HitObjectLifetimeEntry, parent?: HitObject)
  {
    const hitObject = entry.hitObject;

    if (this.#entryMap.has(hitObject))
      throw new Error("The HitObjectLifetimeEntry is already added to this HitObjectEntryManager.");

    this.#entryMap.set(hitObject, entry);

    if (parent)
    {
      this.#parentMap.set(entry, parent);

      const parentEntry = this.#entryMap.get(parent);
      if (parentEntry)
        parentEntry.nestedEntries.add(entry);
    }

    hitObject.defaultsApplied.addListener(this.#onDefaultsApplied, this);
    this.onEntryAdded.emit({ entry, parent });
  }

  public remove(entry: HitObjectLifetimeEntry): boolean
  {
    if (entry instanceof SyntheticHitObjectEntry)
      return false;

    const hitObject = entry.hitObject;

    if (!this.#entryMap.delete(hitObject))
      throw new Error("The HitObjectLifetimeEntry is not contained in this HitObjectEntryManager.");

    const parent = this.#parentMap.get(entry);
    if (parent)
    {
      this.#parentMap.delete(entry);

      const parentEntry = this.#entryMap.get(parent);
      if (parentEntry)
        parentEntry.nestedEntries.delete(entry);
    }

    for (const childEntry of entry.nestedEntries)
      this.remove(childEntry);

    hitObject.defaultsApplied.removeListener(this.#onDefaultsApplied, this);
    this.onEntryRemoved.emit({ entry, parent });
    return true;
  }

  #onDefaultsApplied(hitObject: HitObject)
  {
    const entry = this.#entryMap.get(hitObject);
    if (!entry)
      return;

    const previousEntries = entry.nestedEntries;
    entry.nestedEntries = new Set();

    for (const nested of previousEntries)
      this.remove(nested);
  }

  get(hitObject: HitObject)
  {
    return this.#entryMap.get(hitObject);
  }
}

export interface HitObjectEntryManagerEvent
{
  readonly entry: HitObjectLifetimeEntry,
  readonly parent?: HitObject
}

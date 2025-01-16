import type { HitObjectLifetimeEntry } from '../../hitObjects/drawables/HitObjectLifetimeEntry';
import type { HitObject } from '../../hitObjects/HitObject';
import { Action } from '@osucad/framework';
import { SyntheticHitObjectEntry } from '../../hitObjects/drawables/SyntheticHitObjectEntry';

export class HitObjectEntryManager {
  get allEntries() {
    return this.#entryMap.values();
  }

  readonly onEntryAdded = new Action<[HitObjectLifetimeEntry, HitObject | undefined]>();

  readonly onEntryRemoved = new Action<[HitObjectLifetimeEntry, HitObject | undefined]>();

  readonly #entryMap = new Map<HitObject, HitObjectLifetimeEntry>();

  readonly #parentMap = new Map<HitObjectLifetimeEntry, HitObject>();

  add(entry: HitObjectLifetimeEntry, parent?: HitObject) {
    const hitObject = entry.hitObject;

    if (this.#entryMap.has(hitObject))
      throw new Error('Entry already exists');

    this.#entryMap.set(hitObject, entry);

    if (parent) {
      this.#parentMap.set(entry, parent);
      const parentEntry = this.#entryMap.get(parent);
      if (parentEntry)
        parentEntry.nestedEntries.push(entry);
    }

    hitObject.defaultsApplied.addListener(this.#onDefaultsApplied, this);
    this.onEntryAdded.emit([entry, parent]);
  }

  remove(entry: HitObjectLifetimeEntry) {
    if (entry instanceof SyntheticHitObjectEntry)
      return false;

    const hitObject = entry.hitObject;
    if (!this.#entryMap.delete(hitObject))
      throw new Error('Entry does not exist');

    const parent = this.#parentMap.get(entry);
    if (parent) {
      const parentEntry = this.#entryMap.get(parent);
      parentEntry?.nestedEntries.splice(parentEntry.nestedEntries.indexOf(entry), 1);
    }

    for (const child of entry.nestedEntries)
      this.remove(child);

    hitObject.defaultsApplied.removeListener(this.#onDefaultsApplied);
    this.onEntryRemoved.emit([entry, parent]);

    return true;
  }

  get(hitObject: HitObject) {
    return this.#entryMap.get(hitObject);
  }

  #onDefaultsApplied(hitObject: HitObject) {
    const entry = this.#entryMap.get(hitObject);
    if (!entry)
      return;

    const previousEntries = entry.nestedEntries;
    entry.nestedEntries = [];

    for (const nested of previousEntries)
      this.remove(nested);
  };
}

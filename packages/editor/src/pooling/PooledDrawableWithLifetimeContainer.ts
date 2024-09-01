import type { Drawable } from 'osucad-framework';
import { CompositeDrawable } from 'osucad-framework';
import { LifetimeEntryManager } from './LifetimeEntryManager';
import type { LifetimeEntry } from './LifetimeEntry';
import { LifetimeBoundaryKind } from './LifetimeBoundaryKind';
import { LifetimeBoundaryCrossingDirection } from './LifetimeBoundaryCrossingDirection';

export abstract class PooledDrawableWithLifetimeContainer<TEntry extends LifetimeEntry, TDrawable extends Drawable> extends CompositeDrawable {
  get entries() {
    return this.#allEntries;
  }

  get aliveEntries(): ReadonlyMap<TEntry, TDrawable> {
    return this.#aliveDrawableMap;
  }

  get removeRewoundEntries() {
    return false;
  }

  pastLifetimeExtension = 0;

  futureLifetimeExtension = 0;

  readonly #aliveDrawableMap = new Map<TEntry, TDrawable>();

  readonly #allEntries = new Set<TEntry>();

  #lifetimeManager = new LifetimeEntryManager();

  protected constructor() {
    super();

    this.#lifetimeManager.entryBecameAlive.addListener(this.#entryBecameAlive);
    this.#lifetimeManager.entryBecameDead.addListener(this.#entryBecameDead);
    this.#lifetimeManager.entryCrossedBoundary.addListener(this.#entryCrossedBoundary);
  }

  addEntry(entry: TEntry) {
    this.#allEntries.add(entry);
    this.#lifetimeManager.addEntry(entry);
  }

  removeEntry(entry: TEntry): boolean {
    if (!this.#lifetimeManager.removeEntry(entry))
      return false;

    this.#allEntries.delete(entry);
    return true;
  }

  abstract getDrawable(entry: TEntry): TDrawable;

  #entryBecameAlive = (lifetimeEntry: LifetimeEntry) => {
    const entry = lifetimeEntry as TEntry;
    console.assert(!this.#aliveDrawableMap.has(entry));

    const drawable = this.getDrawable(entry);
    this.#aliveDrawableMap.set(entry, drawable);
    this.addDrawable(entry, drawable);
  };

  protected addDrawable(entry: TEntry, drawable: TDrawable) {
    this.addInternal(drawable);
  }

  #entryBecameDead = (lifetimeEntry: LifetimeEntry) => {
    const entry = lifetimeEntry as TEntry;
    console.assert(this.#aliveDrawableMap.has(entry));

    const drawable = this.#aliveDrawableMap.get(entry)!;
    this.#aliveDrawableMap.delete(entry);
    this.removeDrawable(entry, drawable);
  };

  protected removeDrawable(entry: TEntry, drawable: TDrawable) {
    this.removeInternal(drawable, false);
  }

  #entryCrossedBoundary = (
    [lifetimeEntry, kind, direction]: [LifetimeEntry, LifetimeBoundaryKind, LifetimeBoundaryCrossingDirection],
  ) => {
    if (this.removeRewoundEntries && kind === LifetimeBoundaryKind.Start && direction === LifetimeBoundaryCrossingDirection.Backward)
      this.removeEntry(lifetimeEntry as TEntry);
  };

  clear() {
    for (const entry of [...this.entries]) {
      this.removeEntry(entry);
    }

    console.assert(this.#aliveDrawableMap.size === 0);
  }

  checkChildrenLife(): boolean {
    if (!this.isPresent)
      return false;

    let aliveChanged = super.checkChildrenLife();
    if (this.#lifetimeManager.update(this.time.current - this.pastLifetimeExtension, this.time.current + this.futureLifetimeExtension))
      aliveChanged = true;

    return aliveChanged;
  }
}

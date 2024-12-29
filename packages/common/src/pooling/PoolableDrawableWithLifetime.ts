import type { LifetimeEntry } from './LifetimeEntry';
import { LoadState, PoolableDrawable } from 'osucad-framework';

export abstract class PoolableDrawableWithLifetime<TEntry extends LifetimeEntry> extends PoolableDrawable {
  #entry: TEntry | null = null;

  get entry() {
    return this.#entry;
  }

  set entry(value) {
    if (this.loadState === LoadState.NotLoaded)
      this.#entry = value;
    else if (value !== null)
      this.apply(value);
    else if (this.hasEntryApplied)
      this.#free();
  }

  #hasEntryApplied = false;

  protected get hasEntryApplied() {
    return this.#hasEntryApplied;
  }

  override get lifetimeStart() {
    return super.lifetimeStart;
  }

  override set lifetimeStart(value) {
    if (this.entry === null && this.lifetimeStart !== value)
      throw new Error('Cannot modify lifetime of PoolableDrawableWithLifetime when entry is not set');

    if (this.entry !== null)
      this.entry.lifetimeStart = value;
  }

  override get lifetimeEnd() {
    return super.lifetimeEnd;
  }

  override set lifetimeEnd(value) {
    if (this.entry === null && this.lifetimeEnd !== value)
      throw new Error('Cannot modify lifetime of PoolableDrawableWithLifetime when entry is not set');

    if (this.entry !== null)
      this.entry.lifetimeEnd = value;
  }

  override get removeWhenNotAlive() {
    return false;
  }

  override get removeCompletedTransforms() {
    return false;
  }

  override set removeCompletedTransforms(value) {
    // Do nothing
  }

  protected constructor(initialEntry?: TEntry) {
    super();
    this.entry = initialEntry ?? null;
  }

  protected override loadAsyncComplete() {
    super.loadAsyncComplete();

    if (this.entry !== null && !this.hasEntryApplied)
      this.#apply(this.entry);
  }

  apply(entry: TEntry) {
    if (this.loadState === LoadState.Loading)
      throw new Error('Cannot apply entry while currently loading');

    this.#apply(entry);
  }

  protected override freeAfterUse() {
    super.freeAfterUse();

    if (this.hasEntryApplied && this.isInPool)
      this.#free();
  }

  protected onApply(entry: TEntry) {
  }

  protected onFree(entry: TEntry) {
  }

  #apply(entry: TEntry) {
    if (this.hasEntryApplied)
      this.#free();

    this.#entry = entry;
    entry.lifetimeChanged.addListener(this.#setLifetimeFromEntry);
    this.#setLifetimeFromEntry();

    this.onApply(entry);

    this.#hasEntryApplied = true;
  }

  #free() {
    console.assert(this.hasEntryApplied, 'Cannot free entry that has not been applied');

    this.onFree(this.entry!);

    this.entry!.lifetimeChanged.removeListener(this.#setLifetimeFromEntry);
    this.#entry = null;
    super.lifetimeStart = -Number.MAX_VALUE;
    super.lifetimeEnd = Number.MAX_VALUE;

    this.#hasEntryApplied = false;
  }

  #setLifetimeFromEntry = () => {
    super.lifetimeStart = this.entry!.lifetimeStart;
    super.lifetimeEnd = this.entry!.lifetimeEnd;
  };
}

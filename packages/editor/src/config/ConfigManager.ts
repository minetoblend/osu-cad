import { Bindable } from 'osucad-framework';

export abstract class ConfigManager<TLookup extends ConfigKey<any>> {

  protected get addMissingEntries() {
    return true;
  }

  readonly #defaultOverrides: Map<TLookup, any>;

  protected readonly configStore = new Map<TLookup, any>();

  protected constructor(defaultOverrides?: Map<TLookup, any>) {
    this.#defaultOverrides = defaultOverrides ?? new Map();
  }

  setValue<T>(key: TLookup & ConfigKey<T>, value: T) {
    const bindable = this.getOriginalBindable(key);

    if (!bindable) {
      this.setDefault(key, value);
      return;
    } else {
      bindable.value = value;
    }
  }

  protected setDefault<T>(lookup: TLookup & ConfigKey<T>, value: T) {
    value = this.#getDefault(lookup, value);

    let bindable = this.getOriginalBindable(lookup);

    if (!bindable)
      bindable = this.#set(lookup, value);
    else
      bindable.value = value;

    bindable.default = value;

    return bindable;
  }

  protected addBindable<T>(lookup: TLookup & ConfigKey<T>, bindable: Bindable<T>) {
    this.configStore.set(lookup, bindable);
    bindable.valueChanged.addListener(this.queueBackgroundSave, this);
  }

  #getDefault<T>(lookup: TLookup & ConfigKey<T>, fallback: T) {
    const defaultOverride = this.#defaultOverrides.get(lookup);

    if (defaultOverride !== undefined)
      return defaultOverride;

    return fallback;
  }

  #set<T>(lookup: TLookup & ConfigKey<T>, value: T) {
    const bindable = new Bindable(value);
    this.addBindable(lookup, bindable);
    return bindable;
  }

  get<T>(lookup: TLookup & ConfigKey<T>): T | null {
    return this.getOriginalBindable(lookup)!.value;
  }

  protected getOriginalBindable<T>(lookup: TLookup & ConfigKey<T>): Bindable<T> | null {
    return this.configStore.get(lookup) ?? null;
  }

  getBindable<T>(lookup: TLookup & ConfigKey<T>): Bindable<T> | null {
    return this.getOriginalBindable(lookup)?.getBoundCopy() ?? null;
  }

  bindWith<T>(lookup: TLookup & ConfigKey<T>, bindable: Bindable<T>) {
    bindable.bindTo(this.getOriginalBindable(lookup)!);
  }

  #hasLoaded = false;

  load() {
    this.performLoad();
    this.#hasLoaded = true;
  }

  #lastSave = 0;

  protected queueBackgroundSave() {
    const lastSave = ++this.#lastSave;

    setTimeout(() => {
      if (this.#lastSave === lastSave)
        this.save();
    }, 100);
  }

  save() {
    if (!this.#hasLoaded)
      return false;

    this.performSave();
    return true;
  }

  protected abstract performLoad(): void;

  protected abstract performSave(): void;

  #isDisposed = false;

  dispose() {
    if (!this.#isDisposed) {
      this.save();
      this.#isDisposed = true;
    }
  }
}

export interface ConfigKey<T> {
  __type__: T;
}

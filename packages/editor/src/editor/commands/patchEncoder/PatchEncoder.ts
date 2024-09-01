export abstract class PatchEncoder<TObject extends object, TPatch> {
  #patch: Partial<TPatch> = {};
  readonly #object: TObject;
  #hasChanges = false;

  get hasChanges() {
    return this.#hasChanges;
  }

  constructor(
    object: TObject,
  ) {
    this.#object = object;
  }

  add(key: keyof TObject, value: any): boolean {
    if (this.encode(this.#patch, this.#object, key, value)) {
      this.#hasChanges = true;
      return true;
    }

    return false;
  }

  protected abstract encode(
    patch: Partial<TPatch>,
    object: TObject,
    key: keyof TObject,
    value: any,
  ): boolean;

  get current() {
    return this.#patch;
  }

  reset() {
    this.#patch = {};
    this.#hasChanges = false;
  }

  getPatch(flush = true) {
    const patch = { ...this.#patch };
    if (flush)
      this.reset();

    return patch;
  }
}

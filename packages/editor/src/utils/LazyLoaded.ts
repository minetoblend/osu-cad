export class LazyLoaded<T> {
  constructor(
    private readonly loader: () => Promise<T>,
  ) {
  }

  #promise?: Promise<T>;

  #loaded = false;

  get loaded() {
    return this.#loaded;
  }

  load(): Promise<T> {
    if (!this.#promise) {
      this.#promise = this.loader().then((result) => {
        this.#loaded = true;

        return result;
      });
    }

    return this.#promise;
  }
}

import type { IFile } from './IFile';

export class SimpleFile implements IFile {
  constructor(
    readonly name: string,
    getData: () => Promise<ArrayBuffer>,
  ) {
    this.#getData = getData;
  }

  readonly #getData: () => Promise<ArrayBuffer>;

  #dataP?: Promise<ArrayBuffer>;

  #data?: ArrayBuffer;

  getData(): Promise<ArrayBuffer> {
    this.#dataP ??= this.#getData().then((data) => {
      this.#data = data;
      return data;
    });

    return this.#dataP;
  }

  getDataSync(): ArrayBuffer | null {
    return this.#data ?? null;
  }

  dispose() {
    this.#dataP = undefined;
    this.#data = undefined;
  }
}

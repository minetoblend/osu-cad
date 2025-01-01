import type { IFile } from './IFile';

export class SimpleFile implements IFile {
  constructor(
    readonly name: string,
    getData: () => Promise<ArrayBuffer>,
  ) {
    this.#getData = getData;
  }

  #getData: () => Promise<ArrayBuffer>;

  #dataP?: Promise<ArrayBuffer>;

  getData(): Promise<ArrayBuffer> {
    this.#dataP ??= this.#getData();
    return this.#dataP;
  }
}

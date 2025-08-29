import type { IResourceStore } from "./IResourceStore";

export class ResourceStore<T> implements IResourceStore<T>
{
  readonly #actionList = new Map<string, () => void>();

  readonly #stores: IResourceStore<T>[] = [];

  readonly #searchExtensions: string[] = [];

  #isDisposed = false;

  public constructor(store?: IResourceStore<T>)
  {
    if (store)
      this.addStore(store);
  }

  public addStore(store: IResourceStore<T>)
  {
    this.#stores.push(store);
  }

  public removeStore(store: IResourceStore<T>): boolean
  {
    const index = this.#stores.indexOf(store);
    if (index >= 0)
    {
      this.#stores.splice(index, 1);
      return true;
    }

    return false;
  }

  public has(name: string): boolean
  {
    const filenames = this.getFilenames(name);
    const stores = this.#getStores();

    for (const store of stores)
    {
      for (const item of filenames)
      {
        if (store.has(item))
          return true;
      }
    }

    return false;
  }

  public async getAsync(name: string): Promise<T | null>
  {
    const filenames = this.getFilenames(name);
    const stores = this.#getStores();

    for (const store of stores)
    {
      for (const item of filenames)
      {
        const value = await store.getAsync(item);
        if (value !== null)
          return value;
      }
    }

    return null;
  }

  public canLoad(name: string)
  {
    const filenames = this.getFilenames(name);
    const stores = this.#getStores();

    for (const store of stores)
    {
      for (const item of filenames)
      {
        if (store.canLoad(item))
          return true;
      }
    }

    return false;
  }

  public get(name: string): T | null
  {
    const filenames = this.getFilenames(name);
    const stores = this.#getStores();

    for (const store of stores)
    {
      for (const item of filenames)
      {
        const value = store.get(item);
        if (value !== null)
          return value;
      }
    }

    return null;
  }

  protected *getFilenames(name: string)
  {
    yield name;
    for (const searchExtension of this.#searchExtensions)
    {
      yield `${name}.${searchExtension}`;
    }
  }

  public bindReload(name: string, onReload: () => void)
  {
    if (this.#actionList.has(name))
      throw new Error(`A reload delegate is already bound to the resource '${name}'`);

    this.#actionList.set(name, onReload);
  }

  public addExtension(extension: string)
  {
    extension = extension.replace(/^\./, "");
    if (!this.#searchExtensions.includes(extension))
      this.#searchExtensions.push(extension);
  }

  public getAvailableResources(): string[]
  {
    return this.#stores.flatMap(store => store.getAvailableResources());
  }

  #getStores()
  {
    return this.#stores;
  }

  public dispose(disposing = true)
  {
    if (this.#isDisposed)
      return;

    this.#isDisposed = true;

    for (const store of this.#stores)
      store.dispose();
  }
}

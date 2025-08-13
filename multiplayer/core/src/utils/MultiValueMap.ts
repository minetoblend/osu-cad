export class MultiValueMap<K, V>
{
  constructor(entries?: readonly (readonly [K, V[]])[] | null)
  {
    this.#map = new Map<K, V[]>(entries);
  }

  readonly #map: Map<K, V[]>;

  get(key: K)
  {
    return this.#map.get(key) ?? [];
  }

  add(key: K, value: V)
  {
    const values = this.#map.get(key);
    if (values !== undefined)
      values.push(value);
    else
      this.#map.set(key, [value]);
  }

  delete(key: K, value?: V)
  {
    if (value !== undefined)
    {
      const values = this.#map.get(key);
      if (!values)
        return false;

      const index = values.indexOf(value);
      if (index < 0)
        return false;

      if (values.length === 1)
      {
        this.#map.delete(key);
        return true;
      }

      values.splice(index, 1);
      return true;
    }

    return this.#map.delete(key);
  }

  clear()
  {
    this.#map.clear();
  }

  entries()
  {
    return this.#map.entries();
  }

  keys()
  {
    return this.#map.keys();
  }

  values()
  {
    return this.#map.values();
  }

  [Symbol.iterator](): MapIterator<[K, V[]]>
  {
    return this.#map[Symbol.iterator]();
  }
}

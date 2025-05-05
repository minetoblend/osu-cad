export class CachedValue<T>
{
  #value?: T;

  get value()
  {
    if (!this.isValid)
    {
      throw new Error("Value is not valid");
    }
    return this.#value!;
  }

  set value(value: T)
  {
    this.#value = value;
    this.#isValid = true;
  }

  #isValid = false;

  get isValid(): boolean
  {
    return this.#isValid;
  }

  invalidate(): boolean
  {
    if (this.isValid)
    {
      this.#isValid = false;
      return true;
    }
    return false;
  }
}

export class Cached
{
  #isValid = false;

  get isValid()
  {
    return this.#isValid;
  }

  invalidate(): boolean
  {
    if (this.isValid)
    {
      this.#isValid = false;
      return true;
    }
    return false;
  }

  validate()
  {
    this.#isValid = true;
  }
}

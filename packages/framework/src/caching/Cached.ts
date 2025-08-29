export class CachedValue<T>
{
  #value?: T;

  public get value()
  {
    if (!this.isValid)
      throw new Error("Value is not valid");

    return this.#value!;
  }

  public set value(value: T)
  {
    this.#value = value;
    this.#isValid = true;
  }

  #isValid = false;

  public get isValid(): boolean
  {
    return this.#isValid;
  }

  public invalidate(): boolean
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

  public get isValid()
  {
    return this.#isValid;
  }

  public invalidate(): boolean
  {
    if (this.isValid)
    {
      this.#isValid = false;
      return true;
    }
    return false;
  }

  public validate()
  {
    this.#isValid = true;
  }
}

import { Bindable } from "./Bindable";

export class BindableWithCurrent<T> extends Bindable<T>
{
  constructor(defaultValue: T)
  {
    super(defaultValue);
  }

  #currentBound?: Bindable<T>;

  get current()
  {
    return this;
  }

  set current(value: Bindable<T>)
  {
    if (this.#currentBound)
    {
      this.unbindFrom(this.#currentBound);
    }

    this.bindTo((this.#currentBound = value));
  }

  unbindFromCurrent()
  {
    if (this.#currentBound)
    {
      this.unbindFrom(this.#currentBound);
      this.#currentBound = undefined;
    }
  }
}

import { Bindable } from "./Bindable";

export class BindableWithCurrent<T> extends Bindable<T>
{
  public constructor(defaultValue: T)
  {
    super(defaultValue);
  }

  #currentBound?: Bindable<T>;

  public get current()
  {
    return this;
  }

  public set current(value: Bindable<T>)
  {
    if (this.#currentBound)
      this.unbindFrom(this.#currentBound);

    this.bindTo((this.#currentBound = value));
  }

  public unbindFromCurrent()
  {
    if (this.#currentBound)
    {
      this.unbindFrom(this.#currentBound);
      this.#currentBound = undefined;
    }
  }
}

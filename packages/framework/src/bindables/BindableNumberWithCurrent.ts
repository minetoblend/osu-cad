import type { Bindable } from "./Bindable";
import { BindableNumber } from "./BindableNumber";

export class BindableNumberWithCurrent extends BindableNumber 
{
  constructor(defaultValue: number) 
  {
    super(defaultValue);
  }

  #currentBound?: Bindable<number>;

  get current(): BindableNumber 
  {
    return this;
  }

  set current(value: Bindable<number>) 
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

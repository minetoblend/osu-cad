import type { Bindable } from "./Bindable";
import { BindableNumber } from "./BindableNumber";

export class BindableNumberWithCurrent extends BindableNumber
{
  public constructor(defaultValue: number)
  {
    super(defaultValue);
  }

  #currentBound?: Bindable<number>;

  public get current(): BindableNumber
  {
    return this;
  }

  public set current(value: Bindable<number>)
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

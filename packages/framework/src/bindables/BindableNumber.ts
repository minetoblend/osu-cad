import type { Comparer } from "../utils/Comparer";
import type { Bindable } from "./Bindable";
import { clamp } from "../utils";
import { NumberComparer } from "../utils/NumberComparer";
import { Action } from "./Action";
import { RangeConstrainedBindable } from "./RangeConstrainedBindable";

export class BindableNumber extends RangeConstrainedBindable<number>
{
  readonly precisionChanged = new Action<number>();

  constructor(defaultValue: number = 0)
  {
    super(defaultValue);

    this.#precision = this.defaultPrecision;

    this.#setValue(this.value);
  }

  #precision: number;

  get precision()
  {
    return this.#precision;
  }

  set precision(value: number)
  {
    if (this.#precision === value)
      return;

    if (value < 0)
    {
      throw new Error("precision must be greater than 0.");
    }

    this.setPrecision(value, true, this);
  }

  setPrecision(precision: number, updateCurrentValue: boolean, source: BindableNumber)
  {
    this.#precision = precision;
    this.triggerPrecisionChange(source);

    if (updateCurrentValue)
    {
      this.#setValue(this.value);
    }
  }

  override get value()
  {
    return super.value;
  }

  override set value(value: number)
  {
    this.#setValue(value);
  }

  #setValue(value: number)
  {
    if (this.comparer.compare(this.precision, this.defaultPrecision) > 0)
    {
      let doubleValue = this.clampValue(value, this.minValue, this.maxValue);
      doubleValue = Math.round(doubleValue / this.precision) * this.precision;

      super.value = doubleValue;
    }
    else
    {
      super.value = this.clampValue(value, this.minValue, this.maxValue);
    }
  }

  protected override get defaultMinValue(): number
  {
    return -Number.MAX_VALUE;
  }

  protected override get defaultMaxValue(): number
  {
    return Number.MAX_VALUE;
  }

  protected get defaultPrecision()
  {
    return Number.EPSILON;
  }

  override triggerChange()
  {
    super.triggerChange();

    this.triggerPrecisionChange(this, false);
  }

  protected triggerPrecisionChange(source?: BindableNumber, propagateToBindings = true)
  {
    const beforePropagation = this.#precision;

    if (propagateToBindings && this.bindings)
    {
      for (const bindable of this.bindings)
      {
        if (bindable === source)
          continue;

        if (bindable && bindable instanceof BindableNumber)
        {
          bindable.setPrecision(this.#precision, false, this);
        }
      }
    }

    if (this.comparer.equals(beforePropagation, this.#precision))
    {
      this.precisionChanged.emit(this.#precision);
    }
  }

  override copyTo(bindable: Bindable<number>)
  {
    if (bindable instanceof BindableNumber)
    {
      bindable.precision = this.precision;
    }

    super.copyTo(bindable);
  }

  override getBoundCopy(): BindableNumber
  {
    return super.getBoundCopy() as BindableNumber;
  }

  set(value: number)
  {
    this.value = value;
  }

  add(value: number)
  {
    this.value += value;
  }

  setProportional(amt: number, snap: number = 0)
  {
    const min = this.minValue;
    const max = this.maxValue;
    let value = min + (max - min) * amt;
    if (snap > 0)
    {
      value = Math.round(value / snap) * snap;
    }
    this.set(value);
  }

  override unbindEvents()
  {
    super.unbindEvents();

    this.precisionChanged.removeAllListeners();
  }

  protected override get comparer(): Comparer<number>
  {
    return NumberComparer.Instance;
  }

  protected override clampValue(value: number, minValue: number, maxValue: number): number
  {
    return clamp(value, minValue, maxValue);
  }

  protected override isValidRange(min: number, max: number): boolean
  {
    return min <= max;
  }

  withPrecision(value: number): this
  {
    this.precision = value;
    return this;
  }
}

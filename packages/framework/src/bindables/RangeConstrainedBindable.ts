import type { Comparer } from "../utils/Comparer";
import { Action } from "./Action";
import { Bindable } from "./Bindable";

export abstract class RangeConstrainedBindable<T> extends Bindable<T>
{
  public readonly minValueChanged = new Action<[T]>();
  public readonly maxValueChanged = new Action<[T]>();

  protected abstract get comparer(): Comparer<T>;

  #minValue: T;

  public get minValue()
  {
    return this.#minValue;
  }

  public set minValue(value: T)
  {
    if (this.comparer.compare(value, this.#minValue) === 0)
    {
      return;
    }

    this.setMinValue(value, true, this);
  }

  #maxValue: T;

  public get maxValue()
  {
    return this.#maxValue;
  }

  public set maxValue(value: T)
  {
    if (this.comparer.compare(value, this.#maxValue) === 0)
    {
      return;
    }

    this.setMaxValue(value, true, this);
  }

  public override get value()
  {
    return super.value;
  }

  public override set value(value)
  {
    this.#setValue(value);
  }

  protected abstract get defaultMinValue(): T;

  protected abstract get defaultMaxValue(): T;

  public get hasDefinedRange()
  {
    return !(
      this.comparer.equals(this.#minValue, this.defaultMinValue)
      || this.comparer.equals(this.#maxValue, this.defaultMaxValue)
    );
  }

  protected constructor(defaultValue: T)
  {
    super(defaultValue);

    // @ts-expect-error - TS doesn't like abstract properties in constructors
    this.#minValue = this.defaultMinValue;
    // @ts-expect-error - same thing again
    this.#maxValue = this.defaultMaxValue;

    this.#setValue(defaultValue);
  }

  public get normalizedValue()
  {
    const min = this.#convertToSingle(this.#minValue);
    const max = this.#convertToSingle(this.#maxValue);

    if (max - min === 0)
      return 1;

    const val = this.#convertToSingle(this.value);
    return (val - min) / (max - min);
  }

  #convertToSingle(value: T): number
  {
    if (typeof value === "number")
    {
      return value;
    }

    throw new Error(`Cannot convert ${value} to single`);
  }

  public setMinValue(value: T, updateCurrentValue: boolean, source: RangeConstrainedBindable<T>)
  {
    this.#minValue = value;
    this.triggerMinValueChange(source);

    if (updateCurrentValue)
    {
      this.#setValue(this.value);
    }
  }

  public setMaxValue(value: T, updateCurrentValue: boolean, source: RangeConstrainedBindable<T>)
  {
    this.#maxValue = value;
    this.triggerMaxValueChange(source);

    if (updateCurrentValue)
    {
      this.#setValue(this.value);
    }
  }

  public override triggerChange()
  {
    super.triggerChange();

    this.triggerMinValueChange(this, false);
    this.triggerMaxValueChange(this, false);
  }

  protected triggerMinValueChange(source?: RangeConstrainedBindable<T>, propagateToBindings = true)
  {
    const beforePropagation = this.#minValue;

    if (propagateToBindings && this.bindings)
    {
      for (const bindable of this.bindings)
      {
        if (bindable === source)
          continue;

        if (bindable && bindable instanceof RangeConstrainedBindable)
        {
          bindable.setMinValue(this.#minValue, false, this);
        }
      }
    }

    if (this.comparer.equals(beforePropagation, this.#minValue))
    {
      this.minValueChanged.emit(this.#minValue);
    }
  }

  protected triggerMaxValueChange(source?: RangeConstrainedBindable<T>, propagateToBindings = true)
  {
    const beforePropagation = this.#maxValue;

    if (propagateToBindings && this.bindings)
    {
      for (const bindable of this.bindings)
      {
        if (bindable === source)
          continue;

        if (bindable && bindable instanceof RangeConstrainedBindable)
        {
          bindable.setMaxValue(this.#maxValue, false, this);
        }
      }
    }

    if (this.comparer.equals(beforePropagation, this.#maxValue))
    {
      this.maxValueChanged.emit(this.#maxValue);
    }
  }

  public override copyTo(bindable: Bindable<T>)
  {
    if (bindable instanceof RangeConstrainedBindable)
    {
      bindable.minValue = this.minValue;
      bindable.maxValue = this.maxValue;
    }

    super.copyTo(bindable);
  }

  public override bindTo(bindable: Bindable<T>)
  {
    if (bindable instanceof RangeConstrainedBindable)
    {
      if (!this.isValidRange(bindable.minValue, bindable.maxValue))
      {
        throw new Error(
            `The target bindable has specified an invalid range of [${bindable.minValue} - ${bindable.maxValue}].`,
        );
      }
    }

    super.bindTo(bindable);
  }

  public override unbindEvents()
  {
    super.unbindEvents();

    this.minValueChanged.removeAllListeners();
    this.maxValueChanged.removeAllListeners();
  }

  public override getBoundCopy(): Bindable<T>
  {
    const ctor = this.constructor;

    // @ts-expect-error - doing stuff here that I probably shouldn't

    const copy = new ctor(this.default);

    copy.bindTo(this);
    return copy;
  }

  protected abstract clampValue(value: T, minValue: T, maxValue: T): T;

  protected abstract isValidRange(min: T, max: T): boolean;

  #setValue(value: T)
  {
    super.value = this.clampValue(value, this.#minValue, this.#maxValue);
  }

  public withMinValue(value: T): this
  {
    this.minValue = value;
    return this;
  }

  public withMaxValue(value: T): this
  {
    this.maxValue = value;
    return this;
  }

  public withRange(min: T, max: T): this
  {
    this.minValue = min;
    this.maxValue = max;
    return this;
  }
}

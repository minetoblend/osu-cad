import type { Comparer } from '../utils/Comparer.ts';
import { Action } from './Action.ts';
import { Bindable } from './Bindable.ts';

export abstract class RangeConstrainedBindable<T> extends Bindable<T> {
  readonly minValueChanged = new Action<T>();
  readonly maxValueChanged = new Action<T>();

  protected abstract get comparer(): Comparer<T>;

  #minValue: T;

  get minValue() {
    return this.#minValue;
  }

  set minValue(value: T) {
    if (this.comparer.compare(value, this.#minValue) === 0) {
      return;
    }

    this.setMinValue(value, true, this);
  }

  #maxValue: T;

  get maxValue() {
    return this.#maxValue;
  }

  set maxValue(value: T) {
    if (this.comparer.compare(value, this.#maxValue) === 0) {
      return;
    }

    this.setMaxValue(value, true, this);
  }

  override get value() {
    return super.value;
  }

  override set value(value) {
    this.#setValue(value);
  }

  protected abstract get defaultMinValue(): T;

  protected abstract get defaultMaxValue(): T;

  get hasDefinedRange() {
    return (
      this.comparer.equals(this.#minValue, this.defaultMinValue)
      || this.comparer.equals(this.#maxValue, this.defaultMaxValue)
    );
  }

  protected constructor(defaultValue: T) {
    super(defaultValue);

    // @ts-expect-error - TS doesn't like abstract properties in constructors
    this.#minValue = this.defaultMinValue;
    // @ts-expect-error - same thing again
    this.#maxValue = this.defaultMaxValue;

    this.#setValue(defaultValue);
  }

  get normalizedValue() {
    const min = this.#convertToSingle(this.#minValue);
    const max = this.#convertToSingle(this.#maxValue);

    if (max - min === 0)
      return 1;

    const val = this.#convertToSingle(this.value);
    return (val - min) / (max - min);
  }

  #convertToSingle(value: T): number {
    if (typeof value === 'number') {
      return value;
    }

    throw new Error(`Cannot convert ${value} to single`);
  }

  setMinValue(value: T, updateCurrentValue: boolean, source: RangeConstrainedBindable<T>) {
    this.#minValue = value;
    this.triggerMinValueChange(source);

    if (updateCurrentValue) {
      this.#setValue(this.value);
    }
  }

  setMaxValue(value: T, updateCurrentValue: boolean, source: RangeConstrainedBindable<T>) {
    this.#maxValue = value;
    this.triggerMaxValueChange(source);

    if (updateCurrentValue) {
      this.#setValue(this.value);
    }
  }

  override triggerChange() {
    super.triggerChange();

    this.triggerMinValueChange(this, false);
    this.triggerMaxValueChange(this, false);
  }

  protected triggerMinValueChange(source?: RangeConstrainedBindable<T>, propagateToBindings = true) {
    const beforePropagation = this.#minValue;

    if (propagateToBindings && this.bindings) {
      for (const bindable of this.bindings) {
        if (bindable === source)
          continue;

        if (bindable && bindable instanceof RangeConstrainedBindable) {
          bindable.setMinValue(this.#minValue, false, this);
        }
      }
    }

    if (this.comparer.equals(beforePropagation, this.#minValue)) {
      this.minValueChanged.emit(this.#minValue);
    }
  }

  protected triggerMaxValueChange(source?: RangeConstrainedBindable<T>, propagateToBindings = true) {
    const beforePropagation = this.#maxValue;

    if (propagateToBindings && this.bindings) {
      for (const bindable of this.bindings) {
        if (bindable === source)
          continue;

        if (bindable && bindable instanceof RangeConstrainedBindable) {
          bindable.setMaxValue(this.#maxValue, false, this);
        }
      }
    }

    if (this.comparer.equals(beforePropagation, this.#maxValue)) {
      this.maxValueChanged.emit(this.#maxValue);
    }
  }

  override copyTo(bindable: Bindable<T>) {
    if (bindable instanceof RangeConstrainedBindable) {
      bindable.minValue = this.minValue;
      bindable.maxValue = this.maxValue;
    }

    super.copyTo(bindable);
  }

  override bindTo(bindable: Bindable<T>) {
    if (bindable instanceof RangeConstrainedBindable) {
      if (!this.isValidRange(bindable.minValue, bindable.maxValue)) {
        throw new Error(
          `The target bindable has specified an invalid range of [${bindable.minValue} - ${bindable.maxValue}].`,
        );
      }
    }

    super.bindTo(bindable);
  }

  override unbindEvents() {
    super.unbindEvents();

    this.minValueChanged.removeAllListeners();
    this.maxValueChanged.removeAllListeners();
  }

  override getBoundCopy(): Bindable<T> {
    const ctor = this.constructor;

    // @ts-expect-error - doing stuff here that I probably shouldn't
    const copy = new ctor(this.default);

    copy.bindTo(this);
    return copy;
  }

  protected abstract clampValue(value: T, minValue: T, maxValue: T): T;

  protected abstract isValidRange(min: T, max: T): boolean;

  #setValue(value: T) {
    super.value = this.clampValue(value, this.#minValue, this.#maxValue);
  }
}

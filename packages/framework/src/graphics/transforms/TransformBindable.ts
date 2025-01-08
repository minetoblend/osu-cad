import type { Bindable } from '../../bindables/Bindable';
import type { ITransformable } from './ITransformable';
import { Interpolation } from './Interpolation';
import { TypedTransform } from './Transform';

export class TransformBindable<TValue, T extends ITransformable> extends TypedTransform<TValue, T> {
  constructor(readonly targetBindable: Bindable<TValue>) {
    super();

    this.targetMember = Math.random().toString();
  }

  override readonly targetMember: string;

  #valueAt(time: number): TValue {
    if (time < this.startTime)
      return this.startValue;
    if (time >= this.endTime)
      return this.endValue;

    return Interpolation.valueAt(time, this.startValue, this.endValue, this.startTime, this.endTime, this.easing);
  }

  override applyTo(target: T, time: number) {
    this.targetBindable.value = this.#valueAt(time);
  }

  override readIntoStartValueFrom(target: T) {
    this.startValue = this.targetBindable.value;
  }

  override clone(): TypedTransform<TValue, T> {
    return new TransformBindable<TValue, T>(this.targetBindable);
  }
}

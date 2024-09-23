import type { ITransformable } from './ITransformable.ts';
import { Color } from 'pixi.js';
import { Interpolation } from './Interpolation.ts';
import { TypedTransform } from './Transform.ts';

export class TransformCustom<TValue, T extends ITransformable> extends TypedTransform<TValue, T> {
  constructor(propertyOrFieldName: string, grouping?: string) {
    super();

    this.targetMember = propertyOrFieldName;
    this.#targetGrouping = grouping ?? propertyOrFieldName;
  }

  override readonly targetMember: string;

  override get targetGrouping(): string {
    return this.#targetGrouping;
  }

  readonly #targetGrouping: string;

  #valueAt(time: number): TValue {
    if (time < this.startTime)
      return this.startValue;
    if (time >= this.endTime)
      return this.endValue;

    return Interpolation.valueAt(time, this.startValue, this.endValue, this.startTime, this.endTime, this.easing);
  }

  override applyTo(target: T, time: number) {
    const value = this.#valueAt(time);

    Reflect.set(target, this.targetMember, value);
  }

  override readIntoStartValueFrom(target: T) {
    let startValue = Reflect.get(target, this.targetMember) as any;

    if (startValue && typeof startValue === 'object' && 'clone' in startValue) {
      startValue = startValue.clone() as TValue;
    }
    else if (typeof startValue === 'object' && startValue instanceof Color) {
      startValue = new Color(startValue);
    }

    this.startValue = startValue;
  }

  override clone(): TransformCustom<TValue, T> {
    const transform = new TransformCustom<TValue, T>(this.targetMember, this.#targetGrouping);

    Object.assign(transform, this);

    return transform;
  }
}

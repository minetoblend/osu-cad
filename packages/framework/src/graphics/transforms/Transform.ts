import type { IComparer } from "../../utils";
import type { ITransformable } from "./ITransformable";
import { EasingFunction } from "./EasingFunction";

export abstract class Transform
{
  static COMPARER: IComparer<Transform> = {
    compare: (a, b) =>
    {
      let compare = a.startTime - b.startTime;
      if (compare !== 0)
        return compare;

      compare = a.transformID - b.transformID;

      return compare;
    },
  };

  transformID: number = 0;

  applied = false;

  appliedToEnd = false;

  get rewindable()
  {
    return true;
  }

  abstract get targetTransformable(): ITransformable;

  startTime = 0;

  endTime = 0;

  get isLooping()
  {
    return this.loopCount === -1 || this.loopCount > 0;
  }

  loopDelay = 0;

  loopCount = 0;

  hasStartValue = false;

  abstract get targetMember(): string;

  abstract readIntoStartValue(): void;

  get targetGrouping(): string
  {
    return this.targetMember;
  }

  abstract apply(time: number): void;

  triggerComplete()
  {}

  abstract clone(): Transform;
}

export abstract class TypedTransform<TValue, T extends ITransformable> extends Transform
{
  #startValue?: TValue;

  get startValue(): TValue
  {
    return this.#startValue!;
  }

  set startValue(value: TValue)
  {
    this.#startValue = value;
  }

  #endValue?: TValue;

  get endValue(): TValue
  {
    return this.#endValue!;
  }

  set endValue(value: TValue)
  {
    this.#endValue = value;
  }

  target!: T;

  override get targetTransformable(): ITransformable
  {
    return this.target;
  }

  easing: EasingFunction = EasingFunction.Default;

  override apply(time: number)
  {
    this.applyTo(this.target, time);
    this.applied = true;
  }

  override readIntoStartValue()
  {
    this.readIntoStartValueFrom(this.target);
  }

  abstract applyTo(target: T, time: number): void;

  abstract readIntoStartValueFrom(target: T): void;

  abstract override clone(): TypedTransform<TValue, T>;
}

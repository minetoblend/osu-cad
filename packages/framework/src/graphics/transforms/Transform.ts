import type { IComparer } from "../../utils";
import type { ITransformable } from "./ITransformable";
import { EasingFunction } from "./EasingFunction";

export abstract class Transform
{
  public static readonly COMPARER: IComparer<Transform> = {
    compare: (a, b) =>
    {
      let compare = a.startTime - b.startTime;
      if (compare !== 0)
        return compare;

      compare = a.transformID - b.transformID;

      return compare;
    },
  };

  public transformID: number = 0;

  public applied = false;

  public appliedToEnd = false;

  public get rewindable()
  {
    return true;
  }

  public abstract get targetTransformable(): ITransformable;

  public startTime = 0;

  public endTime = 0;

  public get isLooping()
  {
    return this.loopCount === -1 || this.loopCount > 0;
  }

  public loopDelay = 0;

  public loopCount = 0;

  public hasStartValue = false;

  public abstract get targetMember(): string;

  public abstract readIntoStartValue(): void;

  public get targetGrouping(): string
  {
    return this.targetMember;
  }

  public abstract apply(time: number): void;

  public triggerComplete()
  {}

  public abstract clone(): Transform;
}

export abstract class TypedTransform<TValue, T extends ITransformable> extends Transform
{
  #startValue?: TValue;

  public get startValue(): TValue
  {
    return this.#startValue!;
  }

  public set startValue(value: TValue)
  {
    this.#startValue = value;
  }

  #endValue?: TValue;

  public get endValue(): TValue
  {
    return this.#endValue!;
  }

  public set endValue(value: TValue)
  {
    this.#endValue = value;
  }

  public target!: T;

  public override get targetTransformable(): ITransformable
  {
    return this.target;
  }

  public easing: EasingFunction = EasingFunction.Default;

  public override apply(time: number)
  {
    this.applyTo(this.target, time);
    this.applied = true;
  }

  public override readIntoStartValue()
  {
    this.readIntoStartValueFrom(this.target);
  }

  protected abstract applyTo(target: T, time: number): void;

  protected abstract readIntoStartValueFrom(target: T): void;

  public abstract override clone(): TypedTransform<TValue, T>;
}

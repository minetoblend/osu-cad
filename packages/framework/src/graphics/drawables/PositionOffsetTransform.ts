import { TypedTransform } from "../transforms/Transform";
import type { Drawable } from "./Drawable";
import type { Vec2 } from "../../math/Vec2";
import { Interpolation } from "../transforms/Interpolation";

export class PositionOffsetTransform<T extends Drawable> extends TypedTransform<Vec2, T>
{

  override get targetMember(): string
  {
    return "position";
  }

  constructor(readonly offset: Vec2)
  {
    super();
  }

  #positionAt(time: number)
  {
    if (time <= this.startTime)
      return this.startValue;
    if (time >= this.endTime)
      return this.endValue;

    return Interpolation.valueAt(time, this.startValue, this.endValue, this.startTime, this.endTime, this.easing);
  }

  override applyTo(target: Drawable, time: number)
  {
    target.position = this.#positionAt(time);
  }

  override readIntoStartValueFrom(target: Drawable)
  {
    this.startValue = target.position;
    this.endValue = target.position.add(this.offset);
  }

  override clone(): TypedTransform<Vec2, T>
  {
    const transform = new PositionOffsetTransform<T>(this.offset);

    Object.assign(transform, this);

    return transform;
  }
}

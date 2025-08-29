import type { Vec2 } from "../../math";
import type { ColorSource } from "pixi.js";
import type { Drawable } from "../drawables/Drawable";
import { EasingFunction } from "./EasingFunction";
import { TransformSequence } from "./TransformSequence";

export class DrawableTransformSequence<T extends Drawable> extends TransformSequence<T>
{
  public fadeTo(alpha: number, duration: number = 0, easing: EasingFunction = EasingFunction.Default)
  {
    return this.append(o => o.fadeTo(alpha, duration, easing));
  }

  public fadeIn(duration: number = 0, easing: EasingFunction = EasingFunction.Default)
  {
    return this.append(o => o.fadeIn(duration, easing));
  }

  public fadeInFromZero(duration: number = 0, easing: EasingFunction = EasingFunction.Default)
  {
    return this.append(o => o.fadeInFromZero(duration, easing));
  }

  public fadeOut(duration: number = 0, easing: EasingFunction = EasingFunction.Default)
  {
    return this.append(o => o.fadeOut(duration, easing));
  }

  public fadeOutFromOne(duration: number = 0, easing: EasingFunction = EasingFunction.Default)
  {
    return this.append(o => o.fadeOutFromOne(duration, easing));
  }

  public fadeColor(color: ColorSource, duration: number = 0, easing: EasingFunction = EasingFunction.Default)
  {
    return this.append(o => o.fadeColor(color, duration, easing));
  }

  public flashColorTo(color: ColorSource, duration: number = 0, easing: EasingFunction = EasingFunction.Default)
  {
    return this.append(o => o.flashColorTo(color, duration, easing));
  }

  public moveTo(newPosition: Vec2, duration: number, easing: EasingFunction = EasingFunction.Default)
  {
    return this.append(o => o.moveTo(newPosition, duration, easing));
  }

  public moveToX(newX: number, duration: number, easing: EasingFunction = EasingFunction.Default)
  {
    return this.append(o => o.moveToX(newX, duration, easing));
  }

  public moveToY(newY: number, duration: number, easing: EasingFunction = EasingFunction.Default)
  {
    return this.append(o => o.moveToY(newY, duration, easing));
  }

  public rotateTo(newRotation: number, duration: number = 0, easing: EasingFunction = EasingFunction.Default)
  {
    return this.append(o => o.rotateTo(newRotation, duration, easing));
  }

  public scaleTo(newScale: number | Vec2, duration: number = 0, easing: EasingFunction = EasingFunction.Default)
  {
    return this.append(o => o.scaleTo(newScale, duration, easing));
  }

  public resizeTo(newSize: number | Vec2, duration: number = 0, easing: EasingFunction = EasingFunction.Default)
  {
    return this.append(o => o.resizeTo(newSize, duration, easing));
  }

  public resizeWidthTo(newWidth: number, duration: number = 0, easing: EasingFunction = EasingFunction.Default)
  {
    return this.append(o => o.resizeWidthTo(newWidth, duration, easing));
  }

  public resizeHeightTo(newHeight: number, duration: number = 0, easing: EasingFunction = EasingFunction.Default)
  {
    return this.append(o => o.resizeHeightTo(newHeight, duration, easing));
  }

  public transformTo<TProperty extends string & keyof T>(
    propertyOrFieldName: TProperty,
    newValue: T[TProperty],
    duration: number = 0,
    easing: EasingFunction = EasingFunction.Default,
    grouping?: string,
  )
  {
    return this.append(o => o.transformTo(propertyOrFieldName, newValue, duration, easing, grouping));
  }
}

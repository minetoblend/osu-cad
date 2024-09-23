import type { Vec2 } from '../../math';
import type { ColorSource } from '../../pixi.ts';
import type { Drawable } from '../drawables/Drawable.ts';
import { EasingFunction } from './EasingFunction.ts';
import { TransformSequence } from './TransformSequence.ts';

export class DrawableTransformSequence<T extends Drawable> extends TransformSequence<T> {
  fadeTo(alpha: number, duration: number = 0, easing: EasingFunction = EasingFunction.Default) {
    return this.append(o => o.fadeTo(alpha, duration, easing));
  }

  fadeIn(duration: number = 0, easing: EasingFunction = EasingFunction.Default) {
    return this.append(o => o.fadeIn(duration, easing));
  }

  fadeInFromZero(duration: number = 0, easing: EasingFunction = EasingFunction.Default) {
    return this.append(o => o.fadeInFromZero(duration, easing));
  }

  fadeOut(duration: number = 0, easing: EasingFunction = EasingFunction.Default) {
    return this.append(o => o.fadeOut(duration, easing));
  }

  fadeOutFromOne(duration: number = 0, easing: EasingFunction = EasingFunction.Default) {
    return this.append(o => o.fadeOutFromOne(duration, easing));
  }

  fadeColor(color: ColorSource, duration: number = 0, easing: EasingFunction = EasingFunction.Default) {
    return this.append(o => o.fadeColor(color, duration, easing));
  }

  flashColorTo(color: ColorSource, duration: number = 0, easing: EasingFunction = EasingFunction.Default) {
    return this.append(o => o.flashColorTo(color, duration, easing));
  }

  moveTo(newPosition: Vec2, duration: number, easing: EasingFunction = EasingFunction.Default) {
    return this.append(o => o.moveTo(newPosition, duration, easing));
  }

  moveToX(newX: number, duration: number, easing: EasingFunction = EasingFunction.Default) {
    return this.append(o => o.moveToX(newX, duration, easing));
  }

  moveToY(newY: number, duration: number, easing: EasingFunction = EasingFunction.Default) {
    return this.append(o => o.moveToY(newY, duration, easing));
  }

  rotateTo(newRotation: number, duration: number = 0, easing: EasingFunction = EasingFunction.Default) {
    return this.append(o => o.rotateTo(newRotation, duration, easing));
  }

  scaleTo(newScale: number | Vec2, duration: number = 0, easing: EasingFunction = EasingFunction.Default) {
    return this.append(o => o.scaleTo(newScale, duration, easing));
  }

  resizeTo(newSize: number | Vec2, duration: number = 0, easing: EasingFunction = EasingFunction.Default) {
    return this.append(o => o.resizeTo(newSize, duration, easing));
  }

  resizeWidthTo(newWidth: number, duration: number = 0, easing: EasingFunction = EasingFunction.Default) {
    return this.append(o => o.resizeWidthTo(newWidth, duration, easing));
  }

  resizeHeightTo(newHeight: number, duration: number = 0, easing: EasingFunction = EasingFunction.Default) {
    return this.append(o => o.resizeHeightTo(newHeight, duration, easing));
  }

  transformTo<TProperty extends string & keyof T>(
    propertyOrFieldName: TProperty,
    newValue: T[TProperty],
    duration: number = 0,
    easing: EasingFunction = EasingFunction.Default,
    grouping?: string,
  ) {
    return this.append(o => o.transformTo(propertyOrFieldName, newValue, duration, easing, grouping));
  }
}

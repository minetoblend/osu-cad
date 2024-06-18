import { Drawable } from '../../drawable/Drawable';
import { Vec2 } from '@osucad/common';
import { UIEvent } from './UIEvent';

export abstract class BaseMouseEvent extends UIEvent {
  protected constructor(
    handler: keyof Drawable,
    readonly underlyingEvent: PointerEvent | WheelEvent,
    readonly screenSpacePosition: Vec2,
  ) {
    super(handler);
  }

  get button() {
    return this.underlyingEvent.button;
  }

  get left() {
    return this.button === 0;
  }

  get middle() {
    return this.button === 1;
  }

  get right() {
    return this.button === 2;
  }

  get ctrl() {
    return this.underlyingEvent.ctrlKey;
  }

  get shift() {
    return this.underlyingEvent.shiftKey;
  }

  currentTarget: Drawable | null = null;

  capturedTarget: Drawable | null = null;

  capture() {
    this.capturedTarget = this.currentTarget;
  }
}

export class MouseDownEvent extends BaseMouseEvent {
  constructor(nativeEvent: PointerEvent, screenSpacePosition: Vec2) {
    super('onMouseDown', nativeEvent, screenSpacePosition);
  }
}

export class MouseUpEvent extends BaseMouseEvent {
  constructor(nativeEvent: PointerEvent, screenSpacePosition: Vec2) {
    super('onMouseUp', nativeEvent, screenSpacePosition);
  }
}

export class MouseMoveEvent extends BaseMouseEvent {
  constructor(nativeEvent: PointerEvent, screenSpacePosition: Vec2) {
    super('onMouseMove', nativeEvent, screenSpacePosition);
  }
}

export class MouseEnterEvent extends BaseMouseEvent {
  constructor(nativeEvent: PointerEvent, screenSpacePosition: Vec2) {
    super('onHover', nativeEvent, screenSpacePosition);
  }
}

export class MouseLeaveEvent extends BaseMouseEvent {
  constructor(nativeEvent: PointerEvent, screenSpacePosition: Vec2) {
    super('onHoverLost', nativeEvent, screenSpacePosition);
  }
}

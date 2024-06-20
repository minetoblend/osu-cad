import { AppHost } from '../AppHost';
import { Drawable } from '../drawable/Drawable';
import { Vec2 } from '@osucad/common';
import {
  BaseMouseEvent,
  MouseDownEvent,
  MouseEnterEvent,
  MouseLeaveEvent,
  MouseMoveEvent,
  MouseUpEvent,
} from './events/MouseEvent';
import { UIEvent } from './events/UIEvent';
import { UIWheelEvent } from '@/framework/input/events/UIWheelEvent.ts';

export class InputManager {
  constructor(readonly host: AppHost) {
    this.canvas = this.host.renderer.canvas;
    this.setupListeners();
  }

  canvas: HTMLCanvasElement;

  get stage() {
    return this.host.stage;
  }

  captured?: Drawable;

  setupListeners() {
    this.canvas.addEventListener('pointerdown', (e) => this.onPointerDown(e));
    this.canvas.addEventListener('pointerup', (e) => this.onPointerUp(e));
    this.canvas.addEventListener('pointermove', (e) => this.onPointerMove(e));
    this.canvas.addEventListener('wheel', (e) => this.onWheel(e));
    this.canvas.addEventListener('contextmenu', (e) => e.preventDefault(), {
      passive: false,
    });
    addEventListener('keydown', (e) => this.onKeyDown(e));
    addEventListener('keyup', (e) => this.onKeyUp(e));
  }

  private onPointerDown = (e: PointerEvent) => {
    const event = new MouseDownEvent(e, this.getScreenSpacePosition(e));
    this.dispatchEvent(event, this.stage);
  };

  private onPointerUp = (e: PointerEvent) => {
    const event = new MouseUpEvent(e, this.getScreenSpacePosition(e));

    this.dispatchEvent(event, this.stage);
    this.captured = undefined;
  };

  private onPointerMove = (e: PointerEvent) => {
    this.dispatchEvent(
      new MouseMoveEvent(e, this.getScreenSpacePosition(e)),
      this.stage,
    );
    this.dispatchHoverEvent(
      new MouseEnterEvent(e, this.getScreenSpacePosition(e)),
      new MouseLeaveEvent(e, this.getScreenSpacePosition(e)),
      this.stage,
    );
  };

  onWheel = (e: WheelEvent) => {
    e.preventDefault();
    this.dispatchEvent(
      new UIWheelEvent(e, this.getScreenSpacePosition(e)),
      this.stage,
    );
  };

  private getScreenSpacePosition(e: PointerEvent | WheelEvent): Vec2 {
    const rect = this.canvas.getBoundingClientRect();
    return new Vec2(e.clientX - rect.left, e.clientY - rect.top);
  }

  private dispatchEvent(event: BaseMouseEvent, drawable: Drawable) {
    if (this.captured) {
      const result = (
        this.captured[event.handler] as (evt: UIEvent) => boolean
      )(event);

      if (result) {
        return true;
      }
    }

    if (drawable.canHaveChildren() && drawable.interactiveChildren) {
      for (let i = drawable.internalChildren.length - 1; i >= 0; i--) {
        const child = drawable.internalChildren[i];

        if (this.dispatchEvent(event, child)) {
          return true;
        }
      }
    }

    event.currentTarget = drawable;

    const receiveEvents = drawable.receivePositionalInputAt(
      event.screenSpacePosition,
    );
    if (receiveEvents) {
      const result = (drawable[event.handler] as (evt: UIEvent) => boolean)(
        event,
      );
      if (event.capturedTarget) {
        this.captured = event.capturedTarget;
        return true;
      }
      if (result) {
        return true;
      }
    }
  }

  private dispatchHoverEvent(
    hoverEvent: MouseEnterEvent,
    hoverLostEvent: MouseLeaveEvent,
    drawable: Drawable,
  ) {
    const receiveEvents = drawable.receivePositionalInputAt(
      hoverEvent.screenSpacePosition,
    );
    const hovered = drawable.hovered;
    if (receiveEvents && !hovered) {
      drawable.hovered = true;
      (drawable[hoverEvent.handler] as (evt: UIEvent) => boolean)(hoverEvent);
    } else if (!receiveEvents && hovered) {
      drawable.hovered = false;
      (drawable[hoverLostEvent.handler] as (evt: UIEvent) => boolean)(
        hoverLostEvent,
      );
    }

    if (drawable.canHaveChildren() && drawable.interactiveChildren) {
      for (let i = drawable.internalChildren.length - 1; i >= 0; i--) {
        const child = drawable.internalChildren[i];
        this.dispatchHoverEvent(hoverEvent, hoverLostEvent, child);
      }
    }
  }

  pressedKeys: Set<string> = new Set();

  globalKeyboardReceivers = new Set<Drawable>();

  focused: Drawable | null = null;

  addGlobalKeyboardReceiver(receiver: Drawable) {
    this.globalKeyboardReceivers.add(receiver);
  }

  removeGlobalKeyboardReceiver(receiver: Drawable) {
    this.globalKeyboardReceivers.delete(receiver);
  }

  onKeyDown = (e: KeyboardEvent) => {
    if (this.pressedKeys.has(e.key)) {
      return;
    }
    this.pressedKeys.add(e.key);

    if (this.focused) {
      if (this.focused.onKeyDown(e)) {
        return;
      }
    }

    for (const receiver of this.globalKeyboardReceivers) {
      if (receiver.receiveGlobalKeyboardEvents()) {
        receiver.onGlobalKeyDown(e);
      }
    }
  };

  onKeyUp = (e: KeyboardEvent) => {
    this.pressedKeys.delete(e.key);

    if (this.focused) {
      if (this.focused.onKeyUp(e)) {
        return;
      }
    }

    for (const receiver of this.globalKeyboardReceivers) {
      if (receiver.receiveGlobalKeyboardEvents()) {
        receiver.onGlobalKeyUp(e);
      }
    }
  };

  destroy() {
    this.canvas.removeEventListener('pointerdown', this.onPointerDown);
    this.canvas.removeEventListener('pointerup', this.onPointerUp);
    this.canvas.removeEventListener('pointermove', this.onPointerMove);
    this.canvas.removeEventListener('wheel', this.onWheel);
    removeEventListener('keydown', this.onKeyDown);
    removeEventListener('keyup', this.onKeyUp);
  }
}

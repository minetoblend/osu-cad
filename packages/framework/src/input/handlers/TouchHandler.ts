import type { GameHost } from '../../platform';
import { Vec2 } from '../../math';
import { TouchInput } from '../stateChanges/TouchInput';
import { InputHandler } from './InputHandler';
import { Touch } from './Touch';

export class TouchHandler extends InputHandler {
  override initialize(host: GameHost): boolean {
    if (!super.initialize(host)) {
      return false;
    }

    this.enabled.addOnChangeListener(
      (enabled) => {
        if (enabled) {
          host.renderer.canvas.addEventListener('touchstart', this.#handleTouchStart);
          host.renderer.canvas.addEventListener('touchend', this.#handleTouchEnd);
          host.renderer.canvas.addEventListener('touchmove', this.#handleTouchStart);
        }
        else {
          host.renderer.canvas.removeEventListener('touchstart', this.#handleTouchStart);
          host.renderer.canvas.removeEventListener('touchend', this.#handleTouchEnd);
          host.renderer.canvas.removeEventListener('touchmove', this.#handleTouchStart);
        }
      },
      { immediate: true },
    );

    return true;
  }

  #getTouches(event: TouchEvent, touchList: TouchList = event.touches): Touch[] {
    const rect = (event.target as HTMLCanvasElement).getBoundingClientRect();

    return Array.from(touchList).map((touch) => {
      const x = touch.clientX - rect.left;
      const y = touch.clientY - rect.top;

      return new Touch(touch.identifier, new Vec2(x, y));
    });
  }

  #handleTouchStart = (event: TouchEvent) => {
    event.preventDefault();

    const touches = this.#getTouches(event, event.changedTouches);
    if (touches.length === 0)
      return;

    this.#enqueueTouch(new TouchInput(touches, true));
  };

  #handleTouchEnd = (event: TouchEvent) => {
    event.preventDefault();

    const touches = this.#getTouches(event, event.changedTouches);
    if (touches.length === 0)
      return;

    this.#enqueueTouch(new TouchInput(touches, false));

    event.preventDefault();
  };

  #enqueueTouch(touch: TouchInput): void {
    this.pendingInputs.push(touch);
  }
}

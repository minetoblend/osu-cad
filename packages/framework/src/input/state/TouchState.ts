import { Vec2 } from '../../math';
import { Touch, type TouchSource } from '../handlers/Touch';
import { ButtonStates } from './ButtonStates';

const MAX_TOUCH_COUNT = 10;

export class TouchState {
  readonly activeSources = new ButtonStates<TouchSource>();

  readonly touchPositions = Array.from({ length: MAX_TOUCH_COUNT }, () => new Vec2());

  getTouchPosition(source: TouchSource): Vec2 | null {
    return this.isActive(source) ? this.touchPositions[source] : null;
  }

  isActive(source: TouchSource): boolean {
    return this.activeSources.isPressed(source);
  }

  enumerateDifference(previous: TouchState): { deactivated: Touch[]; activated: Touch[] } {
    const diff = this.activeSources.enumerateDifference(previous.activeSources);

    const pressedCount = diff.pressed.length;
    const releasedCount = diff.released.length;

    if (pressedCount === 0 && releasedCount === 0) {
      return { deactivated: [], activated: [] };
    }

    const pressedTouches = Array.from<Touch>({ length: pressedCount });

    for (let i = 0; i < pressedCount; i++) {
      const s = diff.pressed[i];
      pressedTouches[i] = new Touch(s, this.touchPositions[s]);
    }

    const releasedTouches = Array.from<Touch>({ length: releasedCount });

    for (let i = 0; i < releasedCount; i++) {
      const s = diff.released[i];
      releasedTouches[i] = new Touch(s, this.touchPositions[s]);
    }

    return { deactivated: releasedTouches, activated: pressedTouches };
  }
}

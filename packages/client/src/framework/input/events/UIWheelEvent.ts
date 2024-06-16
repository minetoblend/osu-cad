import { BaseMouseEvent } from '@/framework/input/events/MouseEvent.ts';
import { Vec2 } from '@osucad/common';

export class UIWheelEvent extends BaseMouseEvent {
  constructor(nativeEvent: WheelEvent, screenSpacePosition: Vec2) {
    super('onWheel', nativeEvent, screenSpacePosition);
  }
}

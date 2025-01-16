import type { TickInfo } from '../../../controlPoints/TickGenerator';
import type { TimelineTick } from './TimelineTick';
import { TickType } from '../../../controlPoints/TickType';
import { TimelineTickContainer } from './TimelineTickContainer';

export class BottomTimelineTickContainer extends TimelineTickContainer {
  constructor() {
    super();
  }

  override updateTick(tick: TimelineTick, tickInfo: TickInfo) {
    super.updateTick(tick, tickInfo);

    tick.anchor.set(0.5, 1);
    tick.y = this.drawHeight;

    switch (tickInfo.type) {
      case TickType.Full | TickType.Downbeat:
        tick.scale.set(1.5, 1);
        break;
      case TickType.Full:
        tick.scale.set(1.5, 0.75);
        break;
      case TickType.Half:
        tick.scale.set(1.5, 0.75);
        break;
      case TickType.Third:
        tick.scale.set(1.25, 0.5);
        break;
      case TickType.Quarter:
        tick.scale.set(1.25, 0.5);
        break;
      case TickType.Sixth:
        tick.scale.set(1, 0.4);
        break;
      case TickType.Eighth:
        tick.scale.set(1, 0.35);
        break;
      default:
        tick.scale.set(1, 0.3);
        break;
    }

    tick.scale.y *= this.drawHeight;
  }
}

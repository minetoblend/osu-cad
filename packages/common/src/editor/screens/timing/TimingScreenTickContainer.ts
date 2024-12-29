import type { TickInfo } from '../../../controlPoints/TickGenerator';
import type { TimelineTick } from '../../ui/timeline/TimelineTick';
import { TickType } from '../../../controlPoints/TickType';
import { TimelineTickContainer } from '../../ui/timeline/TimelineTickContainer';

export class TimingScreenTickContainer extends TimelineTickContainer {
  override updateTick(tick: TimelineTick, tickInfo: TickInfo) {
    super.updateTick(tick, tickInfo);

    tick.tint = 0xFFFFFF;
    if (tickInfo.type === TickType.Full) {
      tick.scale.x = 1;
      tick.alpha = 0.5;
    }
    else {
      tick.scale.x = 0.5;
      tick.alpha = 0.25;
    }
  }
}

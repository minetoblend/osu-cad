import type { SortedList } from 'osucad-framework';
import type { TimingPoint } from './TimingPoint';
import { TickType } from '@osucad/common';
import { ControlPointGroup } from './ControlPointGroup';

export class TickGenerator {
  constructor(
    readonly timingPoints: SortedList<TimingPoint>,
  ) {
  }

  * generateTicks(startTime: number, endTime: number, divisor: number) {
    if (this.timingPoints.length === 0)
      return;

    let index = this.timingPoints.binarySearch(new ControlPointGroup(startTime) as any);
    if (index < 0) {
      index = ~index;

      if (index > 0)
        index--;
    }

    let timingPoint = this.timingPoints.get(index)!;

    let offset = Math.floor(
      (startTime - timingPoint.time) / timingPoint.beatLength,
    ) * timingPoint.beatLength;

    while (timingPoint) {
      const nextTimingPoint = this.timingPoints.get(++index);

      let time = offset;

      offset = 0;

      while (true) {
        if (nextTimingPoint && time - timingPoint.time >= nextTimingPoint.time)
          break;

        if (time + timingPoint.time > endTime)
          return;

        let subTicks = Math.round(
          (time / timingPoint.beatLength) * 48,
        );

        const isDownBeat = Math.abs(subTicks) % (48 * 4) === 0;

        subTicks = mod(mod(subTicks, 48) + 48, 48);

        let type = TickType.Full;

        if (subTicks % 48 === 0) {
          type = TickType.Full;
        }
        else if (subTicks % 24 === 0) {
          type = TickType.Half;
        }
        else if (subTicks % 16 === 0) {
          type = TickType.Third;
        }
        else if (subTicks % 12 === 0) {
          type = TickType.Quarter;
        }
        else if (subTicks % 8 === 0) {
          type = TickType.Sixth;
        }
        else if (subTicks % 6 === 0) {
          type = TickType.Eighth;
        }
        else if (subTicks % 4 === 0) {
          type = TickType.Twelfth;
        }
        else if (subTicks % 3 === 0) {
          type = TickType.Sixteenth;
        }
        else {
          type = TickType.Other;
        }

        yield new TickInfo(timingPoint.time + time, type, isDownBeat);

        time += timingPoint.beatLength / divisor;
      }

      timingPoint = nextTimingPoint;
    }
  };
}

export class TickInfo {
  constructor(
    readonly time: number,
    readonly type: TickType,
    readonly isDownBeat: boolean = false,
  ) {
  }
}

function mod(a: number, n: number) {
  return ((a % n) + n) % n;
}

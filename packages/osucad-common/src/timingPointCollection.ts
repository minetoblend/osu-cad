import {IObjectAttributes, ITypeFactory, IUnisonRuntime, SortedCollection,} from "@osucad/unison";
import {TimingPoint} from "./timingPoint";

export class TimingPointCollection extends SortedCollection<TimingPoint> {
  constructor(runtime: IUnisonRuntime) {
    super(
      runtime,
      TimingPointCollectionFactory.Attributes,
      "offset"
    );
  }

  generateTicks(startTime: number, endTime: number, divisor: number): ITick[] {
    if (this.length === 0) return [];

    let { index, found } = this.binarySearch(startTime);
    if (!found && index > 0) index--;

    let timingPoint = this.get(index);

    const ticks: ITick[] = [];

    while (timingPoint && timingPoint.offset < endTime) {
      const increment = timingPoint.beatDuration / divisor;
      const nextTimingPoint = this.get(index + 1);
      let time = timingPoint.offset;
      if (startTime < time) time = startTime - ((startTime - time) % increment);

      while (time < Math.min(endTime, nextTimingPoint?.offset ?? endTime)) {
        time += increment;

        const idx = Math.round((time - timingPoint.offset) / increment);

        const t = ((((idx / divisor) % 1) + 1) % 1) * 12;

        let type: TimingTickType;
        if (t === 0) {
          type = TimingTickType.Full;
        } else if (t === 6) {
          type = TimingTickType.Half;
        } else if (t % 4 === 0) {
          type = TimingTickType.Third;
        } else if (t % 3 === 0) {
          type = TimingTickType.Quarter;
        } else if (t % 2 === 0) {
          type = TimingTickType.Sixth;
        } else {
          type = TimingTickType.Other;
        }

        ticks.push({ time, type });
      }

      timingPoint = nextTimingPoint;
      index++;
    }

    return ticks;
  }

  getTimingPointsInRange(startTime: number, endTime: number): TimingPoint[] {
    let { index, found } = this.binarySearch(startTime);

    const timingPoints: TimingPoint[] = [];
    let timingPoint = this.get(index);
    while (timingPoint && timingPoint.offset < endTime) {
      timingPoints.push(timingPoint);
      timingPoint = this.get(index);
      index++;
    }

    return timingPoints;
  }

  snapTime(time: number, divisor: number): number {
    if (this.length === 0) return time;

    let { index, found } = this.binarySearch(time);
    if (!found && index > 0) index--;

    const timingPoint = this.get(index)!;

    const increment = timingPoint.beatDuration / divisor;

    return Math.floor(
      timingPoint.offset +
      Math.round((time - timingPoint.offset) / increment) * increment
    );
  }

  getTimingPointAt(time: number) {
    let { index, found } = this.binarySearch(time);
    if (!found && index > 0) index--;

    return this.get(index);
  }
}

export const enum TimingTickType {
  Full = 0,
  Half = 1,
  Third = 2,
  Quarter = 3,
  Sixth = 4,
  Other = 5,
}

interface ITick {
  time: number;
  type: TimingTickType;
}

export class TimingPointCollectionFactory
  implements ITypeFactory<TimingPointCollection>
{
  constructor() {}

  static readonly Type = "@osucad/timingPointCollection";

  get type() {
    return TimingPointCollectionFactory.Type;
  }

  static readonly Attributes: IObjectAttributes = {
    type: TimingPointCollectionFactory.Type,
    version: "0.1",
  };

  get attributes() {
    return TimingPointCollectionFactory.Attributes;
  }

  create(runtime: IUnisonRuntime) {
    return new TimingPointCollection(runtime);
  }
}

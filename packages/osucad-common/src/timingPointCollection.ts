import { shallowReactive } from "vue";
import { reactive } from "vue";
import {
  IObjectAttributes,
  ITypeFactory,
  IUnisonRuntime,
  SortedCollection,
} from "@osucad/unison";
import { TimingPoint } from "./timingPoint";

export class TimingPointCollection extends SortedCollection<TimingPoint> {
  constructor(runtime: IUnisonRuntime) {
    super(runtime, TimingPointCollectionFactory.Attributes, "offset");

    this.on("insert", (item) => this.onInsert(item));
    this.on("remove", (item) => this.onRemove(item));
  }

  inheritedTimingPoints = shallowReactive([] as TimingPoint[]);
  uninheritedTimingPoints = shallowReactive([] as TimingPoint[]);

  generateTicks(startTime: number, endTime: number, divisor: number): ITick[] {
    if (this.length === 0) return [];

    let { index, found } = this.binarySearchUninherited(startTime);
    if (!found && index > 0) index--;

    let timingPoint = this.uninheritedTimingPoints[index];

    const ticks: ITick[] = [];

    while (timingPoint && timingPoint.offset < endTime) {
      const increment = timingPoint.beatDuration! / divisor;
      const nextTimingPoint = this.uninheritedTimingPoints[index + 1];
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

  snapTime(time: number, divisor: number, round: boolean = true): number {
    if (this.length === 0) return time;

    let { index, found } = this.binarySearchUninherited(time);
    if (!found && index > 0) index--;

    const timingPoint = this.uninheritedTimingPoints[index];

    const increment = timingPoint.beatDuration! / divisor;
    if (round)
      return Math.floor(
        timingPoint.offset +
          Math.round((time - timingPoint.offset) / increment) * increment
      );

    return Math.floor(
      timingPoint.offset +
        Math.floor((time - timingPoint.offset) / increment) * increment
    );
  }

  getTimingPointAt(time: number, uninherited = false): TimingPoint | undefined {
    if (uninherited) {
      let { index, found } = this.binarySearchUninherited(time);
      if (!found && index > 0) index--;

      return this.uninheritedTimingPoints[index];
    }
    let { index, found } = this.binarySearch(time);
    if (!found && index > 0) index--;

    return this.get(index);
  }

  onInsert(timingPoint: TimingPoint): void {
    if (timingPoint.isInherited) {
      const index = this.inheritedTimingPoints.findIndex(
        (tp) => tp.offset > timingPoint.offset
      );
      this.inheritedTimingPoints.splice(index, 0, timingPoint);
    } else {
      const index = this.uninheritedTimingPoints.findIndex(
        (tp) => tp.offset > timingPoint.offset
      );
      this.uninheritedTimingPoints.splice(index, 0, timingPoint);
    }
  }

  onRemove(timingPoint: TimingPoint): void {
    if (timingPoint.isInherited) {
      const index = this.inheritedTimingPoints.indexOf(timingPoint);
      this.inheritedTimingPoints.splice(index, 1);
    } else {
      const index = this.uninheritedTimingPoints.indexOf(timingPoint);
      this.uninheritedTimingPoints.splice(index, 1);
    }
  }

  onItemChange(item: TimingPoint, key: string, value: any): void {
    super.onItemChange(item, key, value);

    if (key === "offset") {
      if (item.isInherited)
        this.inheritedTimingPoints.sort((a, b) => a.offset - b.offset);
      else this.uninheritedTimingPoints.sort((a, b) => a.offset - b.offset);
    } else if (key === "beatDuration") {
      if (item.isInherited) {
        const index = this.uninheritedTimingPoints.indexOf(item);
        if (index > 0) {
          this.uninheritedTimingPoints.splice(index, 1);
          const newIndex = this.uninheritedTimingPoints.findIndex(
            (tp) => tp.offset > item.offset
          );
          this.inheritedTimingPoints.splice(newIndex, 0, item);
        }
      } else {
        const index = this.inheritedTimingPoints.indexOf(item);
        if (index > 0) {
          this.inheritedTimingPoints.splice(index, 1);
          const newIndex = this.inheritedTimingPoints.findIndex(
            (tp) => tp.offset > item.offset
          );
          this.uninheritedTimingPoints.splice(newIndex, 0, item);
        }
      }
    }
  }

  binarySearchUninherited(value: number): { index: number; found: boolean } {
    let low = 0;
    let high = this.uninheritedTimingPoints.length - 1;
    let mid = 0;
    while (low <= high) {
      mid = Math.floor((low + high) / 2);
      const itemValue = this.uninheritedTimingPoints[mid].get(
        this.sortBy
      ) as number;

      if (itemValue === value) {
        return { index: mid, found: true };
      }
      if (itemValue < value) {
        low = mid + 1;
      }
      if (itemValue > value) {
        high = mid - 1;
      }
    }

    return { index: low, found: false };
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

import { SerializedControlPoints } from '../protocol';
import {
  ControlPoint,
  ControlPointUpdateFlags,
  TimingInfo,
} from './controlPoint';
import { Action } from '../util/action';
import { SerializedTimingPoint, SerializedVelocityPoint } from '../types';
import { hitObjectId } from './hitObject';

export type TimingPoint = ControlPoint & { timing: TimingInfo };
export type VelocityPoint = ControlPoint & { velocityMultiplier: number };

const enum SortFlags {
  None = 0,
  ControlPoints = 1 << 0,
  Timing = 1 << 1,
  Velocity = 1 << 2,
  All = Timing | Velocity,
}

export class ControlPointManager {
  readonly controlPoints: ControlPoint[] = [];
  readonly timing: TimingPoint[] = [];
  readonly velocities: VelocityPoint[] = [];

  constructor(controlPoints: SerializedControlPoints) {
    this.controlPoints = controlPoints.controlPoints.map(
      (controlPoint) => new ControlPoint(controlPoint),
    );
    for (const controlPoint of this.controlPoints) {
      this._onAdd(controlPoint, true);
    }
    this._sort(
      ControlPointUpdateFlags.Timing | ControlPointUpdateFlags.Velocity,
    );
  }

  onAdded = new Action<[ControlPoint]>();
  onRemoved = new Action<[ControlPoint]>();
  onUpdated = new Action<[ControlPoint, flags: ControlPointUpdateFlags]>();

  add(controlPoint: ControlPoint) {
    this.controlPoints.push(controlPoint);
    this._onAdd(controlPoint);
  }

  remove(controlPoint: ControlPoint) {
    const index = this.controlPoints.indexOf(controlPoint);
    if (index === -1) return;
    this.controlPoints.splice(index, 1);
    this._onRemove(controlPoint);
  }

  private _onAdd(controlPoint: ControlPoint, isInit = false) {
    let sortFlags: SortFlags = SortFlags.ControlPoints;
    if (controlPoint.timing) {
      this.timing.push(controlPoint as TimingPoint);
      sortFlags |= SortFlags.Timing;
      controlPoint._inTimingList = true;
    }
    if (controlPoint.velocityMultiplier !== null) {
      this.velocities.push(controlPoint as VelocityPoint);
      sortFlags |= SortFlags.Velocity;
      controlPoint._inVelocityList = true;
    }
    controlPoint.onUpdate.addListener(this._onUpdate);
    if (!isInit) this._sort(sortFlags);
    this.onAdded.emit(controlPoint);
  }

  private _onRemove(controlPoint: ControlPoint) {
    controlPoint.onUpdate.removeListeners();
    if (controlPoint.timing) {
      const index = this.timing.indexOf(controlPoint as TimingPoint);
      if (index !== -1) {
        this.timing.splice(index, 1);
        controlPoint._inTimingList = false;
      }
    }
    if (controlPoint.velocityMultiplier !== null) {
      const index = this.velocities.indexOf(controlPoint as VelocityPoint);
      if (index !== -1) {
        this.velocities.splice(index, 1);
        controlPoint._inVelocityList = false;
      }
    }
    this.onRemoved.emit(controlPoint);
  }

  private _onUpdate = (
    controlPoint: ControlPoint,
    flags: ControlPointUpdateFlags,
  ) => {
    let sortFlags = SortFlags.None;
    if (flags & ControlPointUpdateFlags.StartTime) {
      sortFlags |= SortFlags.All;
    } else {
      if (flags & ControlPointUpdateFlags.Timing) {
        sortFlags |= SortFlags.Timing;
        if (controlPoint.timing && !controlPoint._inTimingList) {
          this.timing.push(controlPoint as TimingPoint);
          controlPoint._inTimingList = true;
        } else if (!controlPoint.timing && controlPoint._inTimingList) {
          const index = this.timing.indexOf(controlPoint as TimingPoint);
          if (index !== -1) {
            this.timing.splice(index, 1);
          }
          controlPoint._inTimingList = false;
        }
      }
      if (flags & ControlPointUpdateFlags.Velocity) {
        sortFlags |= SortFlags.Velocity;
        if (
          controlPoint.velocityMultiplier !== null &&
          !controlPoint._inVelocityList
        ) {
          this.velocities.push(controlPoint as VelocityPoint);
          controlPoint._inVelocityList = true;
        } else if (
          controlPoint.velocityMultiplier === null &&
          controlPoint._inVelocityList
        ) {
          const index = this.velocities.indexOf(controlPoint as VelocityPoint);
          if (index !== -1) {
            this.velocities.splice(index, 1);
          }
          controlPoint._inVelocityList = false;
        }
      }
    }
    this._sort(sortFlags);
    this.onUpdated.emit(controlPoint, flags);
  };

  private sortBy = (a: ControlPoint, b: ControlPoint) => a.time - b.time;

  private _sort(flags: SortFlags) {
    if (flags & SortFlags.ControlPoints) {
      this.controlPoints.sort(this.sortBy);
    }
    if (flags & ControlPointUpdateFlags.Timing) {
      this.timing.sort(this.sortBy);
    }
    if (flags & ControlPointUpdateFlags.Velocity) {
      this.velocities.sort(this.sortBy);
    }
  }

  serialize(): SerializedControlPoints {
    return {
      controlPoints: this.controlPoints.map((controlPoint) =>
        controlPoint.serialize(),
      ),
    };
  }

  serializeLegacy(): {
    timing: SerializedTimingPoint[];
    velocity: SerializedVelocityPoint[];
  } {
    return {
      timing: this.timing
        .filter((it) => it.timing)
        .map((controlPoint) => {
          return {
            time: controlPoint.time,
            beatLength: controlPoint.timing.beatLength,
          };
        }),
      velocity: this.velocities
        .filter((it) => it.velocityMultiplier !== null)
        .map((controlPoint) => {
          return {
            time: controlPoint.time,
            velocity: controlPoint.velocityMultiplier,
          };
        }),
    };
  }

  timingPointAt(time: number): TimingPoint {
    if (this.timing.length === 0) {
      return ControlPoint.default as TimingPoint;
    }

    let { index, found } = this.binarySearch(this.timing, time);
    if (!found && index > 0) index--;

    return this.timing[index];
  }

  createTimingPointAt(time: number) {
    const existing = this.timingPointAt(time);
    if (existing.time === time) return existing;

    const timingPoint = existing.clone();
    timingPoint.time = time;

    this.add(timingPoint);

    return timingPoint;
  }

  getVelocityAt(time: number): number {
    time += 1;
    if (this.velocities.length === 0) {
      return 1;
    }
    let { index, found } = this.binarySearch(this.velocities, time);
    if (!found && index > 0) index--;

    if (!found && this.velocities[0].time > time) return 1;

    return this.velocities[index].velocityMultiplier;
  }

  getTicks(startTime: number, endTime: number, divisor: number = 4) {
    if (this.timing.length == 0) return [];

    let { index, found } = this.binarySearch(this.timing, startTime);
    if (!found && index > 0) index--;

    const ticks: TickInfo[] = [];
    let timingPoint = this.timing[index];
    let offset = 0;
    if (startTime < timingPoint.time) {
      offset =
        -Math.ceil(
          (timingPoint.time - startTime) / timingPoint.timing.beatLength,
        ) * timingPoint.timing.beatLength;
    }

    if (startTime > timingPoint.time) {
      offset =
        Math.floor(
          (startTime - timingPoint.time) / timingPoint.timing.beatLength,
        ) * timingPoint.timing.beatLength;
    }

    while (timingPoint) {
      const tickEndTime = Math.min(
        this.timing[index + 1]?.time ?? endTime,
        endTime,
      );

      const numTicks = Math.ceil(
        ((tickEndTime - timingPoint.time - offset) /
          timingPoint.timing.beatLength) *
          divisor,
      );
      ticks.push(
        ...Array.from({ length: numTicks }, (_, i) => {
          const time = offset + (i * timingPoint.timing.beatLength) / divisor;

          let type = TickType.Full;
          let subticks = Math.round(
            (time / timingPoint.timing.beatLength) * 48,
          );

          const isDownBeat = subticks % (48 * 4) === 0;

          subticks = mod(mod(subticks, 48) + 48, 48);

          if (subticks % 48 === 0) {
            type = TickType.Full;

            if (isDownBeat) {
              type |= TickType.Downbeat;
            }
          } else if (subticks % 24 === 0) {
            type = TickType.Half;
          } else if (subticks % 16 === 0) {
            type = TickType.Third;
          } else if (subticks % 12 === 0) {
            type = TickType.Quarter;
          } else if (subticks % 8 === 0) {
            type = TickType.Sixth;
          } else if (subticks % 6 === 0) {
            type = TickType.Eighth;
          } else if (subticks % 4 === 0) {
            type = TickType.Twelfth;
          } else if (subticks % 3 === 0) {
            type = TickType.Sixteenth;
          } else {
            type = TickType.Other;
          }

          return {
            time: timingPoint.time + time,
            type,
          };
        }),
      );

      timingPoint = this.timing[++index];

      offset = 0;
    }

    return ticks;
  }

  private binarySearch(
    array: { time: number }[],
    time: number,
  ): { index: number; found: boolean } {
    let left = 0;
    let right = array.length - 1;
    while (left <= right) {
      const mid = Math.floor((left + right) / 2);
      if (array[mid].time === time) {
        return { index: mid, found: true };
      } else if (array[mid].time < time) {
        left = mid + 1;
      } else {
        right = mid - 1;
      }
    }
    return { index: left, found: false };
  }

  snap(time: number, divisor: number) {
    const timingPoint = this.timingPointAt(time);

    const beatSnapLength = timingPoint.timing.beatLength / divisor;
    const beats = (Math.max(time, 0) - timingPoint.time) / beatSnapLength;

    const closestBeat = beats < 0 ? -Math.round(-beats) : Math.round(beats);
    const snappedTime = Math.floor(
      timingPoint.time + closestBeat * beatSnapLength,
    );

    if (snappedTime >= 0) return snappedTime;

    return snappedTime + beatSnapLength;
  }

  static fromLegacy(options: {
    timing: SerializedTimingPoint[];
    velocity: SerializedVelocityPoint[];
  }) {
    const map = new Map<number, ControlPoint>();
    const controlPoints = new ControlPointManager({ controlPoints: [] });
    for (const timing of options.timing) {
      const controlPoint = new ControlPoint({
        id: hitObjectId(),
        time: timing.time,
        timing: timing,
        velocityMultiplier: null,
        volume: 100,
        kiai: false,
      });
      controlPoints.add(controlPoint);
      map.set(timing.time, controlPoint);
    }
    for (const velocity of options.velocity) {
      const controlPoint = map.get(velocity.time);
      if (controlPoint) {
        controlPoint.velocityMultiplier = velocity.velocity;
      } else {
        const controlPoint = new ControlPoint({
          id: hitObjectId(),
          time: velocity.time,
          velocityMultiplier: velocity.velocity,
          timing: null,
          volume: 100,
          kiai: false,
        });
        controlPoints.add(controlPoint);
      }
    }
    return controlPoints;
  }

  getById(id: string) {
    return this.controlPoints.find((it) => it.id === id);
  }
}

function mod(a: number, n: number) {
  return ((a % n) + n) % n;
}

export const enum TickType {
  Full = 1,
  Half = 2,
  Third = 3,
  Quarter = 4,
  Sixth = 6,
  Eighth = 8,
  Twelfth = 12,
  Sixteenth = 16,
  Other = -1,
  Downbeat = 128,
}

export interface TickInfo {
  time: number;
  type: TickType;
}

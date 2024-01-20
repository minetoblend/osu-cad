import {SerializedTimingPoint, SerializedVelocityPoint} from "../types";
import {SerializedControlPoints} from "../protocol";


export type TimingPoint = SerializedTimingPoint;
export type VelocityPoint = SerializedVelocityPoint;

export class ControlPointManager {

  readonly velocities: VelocityPoint[];
  readonly timing: TimingPoint[];


  constructor(
    options: SerializedControlPoints,
  ) {
    this.velocities = options.velocity;
    this.timing = options.timing;
  }

  serialize(): SerializedControlPoints {
    return {
      timing: this.timing,
      velocity: this.velocities,
    };
  }

  timingPointAt(time: number): SerializedTimingPoint {
    if (this.timing.length === 0) {
      return {
        time: 0,
        beatLength: 60_000 / 120,
      };
    }
    let { index, found } = this.binarySearch(this.timing, time);
    if (!found && index > 0)
      index--;

    return this.timing[index];
  }

  getVelocityAt(time: number): number {
    if (this.velocities.length === 0) {
      return 1;
    }
    let { index, found } = this.binarySearch(this.velocities, time);
    if (!found && index > 0)
      index--;
    if (index === 0 && this.velocities[index].time > time)
      return 1;

    return this.velocities[index].velocity;
  }

  getTicks(
    startTime: number,
    endTime: number,
    divisor: number = 4,
  ) {
    if (this.timing.length == 0) return [];

    let { index, found } = this.binarySearch(this.timing, startTime);
    if (!found && index > 0)
      index--;

    const ticks: TickInfo[] = [];
    let timingPoint = this.timing[index];
    let offset = 0;
    if (timingPoint.time > startTime) {
      offset = -Math.ceil(
        (timingPoint.time - startTime) / timingPoint.beatLength * divisor,
      ) * timingPoint.beatLength / divisor;
    }

    while (timingPoint) {
      const tickEndTime = Math.min(
        this.timing[index + 1]?.time ?? endTime,
        endTime,
      );

      const numTicks = Math.ceil((tickEndTime - timingPoint.time - offset) / timingPoint.beatLength * divisor);

      ticks.push(
        ...Array.from({ length: numTicks }, (_, i) => {
          const time = offset + i * timingPoint.beatLength / divisor;

          let type = TickType.Full;
          let subticks = Math.round(time / timingPoint.beatLength * 48);
          subticks = mod(mod(subticks, 48) + 48, 48);

          if (subticks % 48 === 0) {
            type = TickType.Full;
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

  private binarySearch(array: { time: number }[], time: number): { index: number, found: boolean } {
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

  snap(time: number, divisor: number, type: "round" | "floor" | "ceil" = "round") {
    const timingPoint = this.timingPointAt(time);
    const offset = time - timingPoint.time;
    const beatLength = timingPoint.beatLength / divisor;
    let beat: number;
    switch (type) {
      case "round":
        beat = Math.round(offset / beatLength);
        break;
      case "floor":
        beat = Math.floor(offset / beatLength);
        break;
      case "ceil":
        beat = Math.ceil(offset / beatLength);
        break;
    }
    return timingPoint.time + beat * beatLength;
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
}

export interface TickInfo {
  time: number;
  type: TickType;
}
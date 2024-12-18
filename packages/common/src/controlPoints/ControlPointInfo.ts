import type { ControlPoint } from './ControlPoint';
import { Action, almostEquals } from 'osucad-framework';
import { ControlPointList } from './ControlPointList';
import { DifficultyPoint } from './DifficultyPoint';
import { EffectPoint } from './EffectPoint';
import { SamplePoint } from './SamplePoint';
import { TickGenerator } from './TickGenerator';
import { TimingPoint } from './TimingPoint';

export class ControlPointInfo {
  timingPoints = new ControlPointList<TimingPoint>();

  difficultyPoints = new ControlPointList<DifficultyPoint>();

  effectPoints = new ControlPointList<EffectPoint>(false);

  samplePoints = new ControlPointList<SamplePoint>();

  anyPointChanged = new Action<ControlPoint>();

  #idMap = new Map<string, ControlPoint>();

  get controlPointLists(): ControlPointList<any>[] {
    return [
      this.timingPoints,
      this.difficultyPoints,
      this.effectPoints,
      this.samplePoints,
    ];
  }

  add(controlPoint: ControlPoint, skipIfRedundant: boolean = false): boolean {
    const list = this.listFor(controlPoint);
    if (!list)
      return false;

    if (skipIfRedundant) {
      const existing = list.controlPointAt(controlPoint.time);
      if (controlPoint.isRedundant(existing))
        return false;
    }

    list.add(controlPoint);

    return true;
  }

  remove(controlPoint: ControlPoint): boolean {
    return this.listFor(controlPoint)?.remove(controlPoint) ?? false;
  }

  snap(time: number, divisor: number, rounded: boolean = true) {
    const timingPoint = this.timingPointAt(time);

    if (!timingPoint)
      return time;

    const beatSnapLength = timingPoint.beatLength / divisor;
    const beats = (Math.max(time, 0) - timingPoint.time) / beatSnapLength;

    const closestBeat = beats < 0 ? -Math.round(-beats) : Math.round(beats);
    let snappedTime = timingPoint.time + closestBeat * beatSnapLength;

    if (rounded)
      snappedTime = Math.floor(snappedTime);

    if (snappedTime >= 0)
      return snappedTime;

    return rounded ? Math.floor(snappedTime + beatSnapLength) : snappedTime + beatSnapLength;
  }

  timingPointAt(time: number) {
    return this.timingPoints.controlPointAt(time) ?? TimingPoint.default;
  }

  difficultyPointAt(time: number) {
    const difficultyPoint = this.difficultyPoints.controlPointAt(time);
    if (!difficultyPoint || difficultyPoint.time > time)
      return DifficultyPoint.default;

    return difficultyPoint;
  }

  effectPointAt(time: number) {
    return this.effectPoints.controlPointAt(time) ?? EffectPoint.default;
  }

  samplePointAt(time: number) {
    return this.samplePoints.controlPointAt(time) ?? SamplePoint.default;
  }

  readonly tickGenerator = new TickGenerator(this.timingPoints);

  listFor<T extends ControlPoint>(controlPoint: T): ControlPointList<T> | undefined {
    switch (controlPoint.constructor) {
      case TimingPoint:
        return this.timingPoints as any;
      case DifficultyPoint:
        return this.difficultyPoints as any;
      case EffectPoint:
        return this.effectPoints as any;
      case SamplePoint:
        return this.samplePoints as any;
      default:
        throw new Error(`Unknown control point type: ${controlPoint.constructor.name}`);
    }
  }

  getById(id: string) {
    return this.#idMap.get(id);
  }

  getControlPointsAtTime(time: number): ControlPoint[] {
    return this.controlPointLists.flatMap(list => list.filter(it => almostEquals(it.time, time, 1)));
  }
}

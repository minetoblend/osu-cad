import type { ISummary, ObjectSummary } from '@osucad/multiplayer';
import type { ControlPoint } from './ControlPoint';
import { Action, almostEquals } from '@osucad/framework';
import { SharedStructure } from '@osucad/multiplayer';
import { ControlPointList } from './ControlPointList';
import { DifficultyPoint } from './DifficultyPoint';
import { EffectPoint } from './EffectPoint';
import { SamplePoint } from './SamplePoint';
import { TickGenerator } from './TickGenerator';
import { TimingPoint } from './TimingPoint';
import { VolumePoint } from './VolumePoint';

export type ControlPointMutation =
  | { op: 'add'; controlPoint: {
    type: string;
    data: ObjectSummary;
  }; }
  | { op: 'remove'; id: string };

export interface ControlPointInfoSummary extends ISummary {
  timingPoints: ObjectSummary[];
  samplePoints: ObjectSummary[];
  difficultyPoints: ObjectSummary[];
  volumePoints: ObjectSummary[];
}

export class ControlPointInfo extends SharedStructure<ControlPointMutation, ControlPointInfoSummary> {
  timingPoints = new ControlPointList<TimingPoint>();

  difficultyPoints = new ControlPointList<DifficultyPoint>();

  effectPoints = new ControlPointList<EffectPoint>(false);

  samplePoints = new ControlPointList<SamplePoint>();

  volumePoints = new ControlPointList<VolumePoint>();

  anyPointChanged = new Action<ControlPoint>();

  added = new Action<ControlPoint>();

  removed = new Action<ControlPoint>();

  #idMap = new Map<string, ControlPoint>();

  get controlPointLists(): ControlPointList<any>[] {
    return [
      this.timingPoints,
      this.difficultyPoints,
      this.effectPoints,
      this.samplePoints,
      this.volumePoints,
    ];
  }

  override handle(mutation: ControlPointMutation): ControlPointMutation | null {
    switch (mutation.op) {
      case 'add': {
        let controlPoint: ControlPoint;
        switch (mutation.controlPoint.type) {
          case 'DifficultyPoint':
            controlPoint = new DifficultyPoint();
            break;
          case 'EffectPoint':
            controlPoint = new EffectPoint();
            break;
          case 'SamplePoint':
            controlPoint = new SamplePoint();
            break;
          case 'VolumePoint':
            controlPoint = new VolumePoint();
            break;
          default:
            throw new Error(`Unknown control point type: ${mutation.controlPoint.type}`);
        }

        controlPoint.initializeFromSummary(mutation.controlPoint.data);

        if (this.#add(controlPoint)) {
          return {
            op: 'remove',
            id: controlPoint.id,
          };
        }
      }
        break;
      case 'remove':
      {
        const controlPoint = this.getById(mutation.id);
        if (controlPoint && this.#remove(controlPoint)) {
          return {
            op: 'add',
            controlPoint: {
              type: this.getTypeName(controlPoint),
              data: controlPoint.createSummary(),
            },
          };
        }
      }
    }
    return null;
  }

  add(controlPoint: ControlPoint, skipIfRedundant: boolean = false): boolean {
    if (!this.#add(controlPoint, skipIfRedundant))
      return false;

    this.submitMutation({
      op: 'add',
      controlPoint: {
        type: this.getTypeName(controlPoint),
        data: controlPoint.createSummary(),
      },
    }, {
      op: 'remove',
      id: controlPoint.id,
    });

    return true;
  }

  #add(controlPoint: ControlPoint, skipIfRedundant: boolean = false) {
    if (this.#idMap.has(controlPoint.id)) {
      console.warn('Tried to add control point that was already in the list');
      return false;
    }

    const list = this.listFor(controlPoint);
    if (!list)
      return false;

    if (skipIfRedundant) {
      const existing = list.controlPointAt(controlPoint.time);
      if (controlPoint.isRedundant(existing))
        return false;
    }

    list.add(controlPoint);
    this.#idMap.set(controlPoint.id, controlPoint);

    this.attachChild(controlPoint);
    this.added.emit(controlPoint);

    this.anyPointChanged.emit(controlPoint);

    controlPoint.changed.addListener(this.anyPointChanged.emit, this.anyPointChanged);

    return true;
  }

  protected getTypeName(controlPoint: ControlPoint) {
    switch (controlPoint.constructor) {
      case DifficultyPoint:
        return 'DifficultyPoint';
      case EffectPoint:
        return 'EffectPoint';
      case SamplePoint:
        return 'SamplePoint';
      case VolumePoint:
        return 'VolumePoint';
      default:
        return 'ControlPoint';
    }
  }

  remove(controlPoint: ControlPoint): boolean {
    if (!this.#remove(controlPoint))
      return false;

    this.submitMutation({
      op: 'remove',
      id: controlPoint.id,
    }, {
      op: 'add',
      controlPoint: {
        type: this.getTypeName(controlPoint),
        data: controlPoint.createSummary(),
      },
    });

    return true;
  }

  #remove(controlPoint: ControlPoint) {
    if (this.#idMap.delete(controlPoint.id)) {
      controlPoint.detach();
      this.listFor(controlPoint)?.remove(controlPoint);
      this.removed.emit(controlPoint);

      controlPoint.changed.removeListener(this.anyPointChanged.emit, this.anyPointChanged);

      this.anyPointChanged.emit(controlPoint);

      return true;
    }

    return false;
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

  nextTimingPointAfter(time: number) {
    const index = this.timingPoints.controlPointIndexAt(time);

    return this.timingPoints.get(index + 1) ?? null;
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

  volumePointAt(time: number) {
    return this.samplePoints.controlPointAt(time) ?? SamplePoint.default;
  }

  volumeAt(time: number) {
    const index = this.volumePoints.controlPointIndexAt(time);

    if (index === -1)
      return VolumePoint.default.volume;

    const point = this.volumePoints.get(index)!;
    const next = this.volumePoints.get(index + 1);

    return point.volumeAtTime(time, next);
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
      case VolumePoint:
        return this.volumePoints as any;
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

  override get childObjects(): SharedStructure<any>[] {
    return this.allControlPoints;
  }

  get allControlPoints(): ControlPoint[] {
    return this.controlPointLists.flatMap(it => it.items);
  }

  override createSummary(): ControlPointInfoSummary {
    return {
      id: this.id,
      timingPoints: this.timingPoints.items.map(it => it.createSummary()),
      samplePoints: this.samplePoints.items.map(it => it.createSummary()),
      difficultyPoints: this.difficultyPoints.items.map(it => it.createSummary()),
      volumePoints: this.volumePoints.items.map(it => it.createSummary()),
    };
  }

  override initializeFromSummary(summary: ControlPointInfoSummary): void {
    this.id = summary.id;

    summary.timingPoints.forEach((summary) => {
      const timingPoint = new TimingPoint();
      timingPoint.initializeFromSummary(summary);
      this.add(timingPoint);
    });

    summary.samplePoints.forEach((summary) => {
      const samplePoint = new SamplePoint();
      samplePoint.initializeFromSummary(summary);
      this.add(samplePoint);
    });

    summary.difficultyPoints.forEach((summary) => {
      const difficultyPoint = new DifficultyPoint();
      difficultyPoint.initializeFromSummary(summary);
      this.add(difficultyPoint);
    });

    summary.volumePoints.forEach((summary) => {
      const volumePoint = new VolumePoint();
      volumePoint.initializeFromSummary(summary);
      this.add(volumePoint);
    });
  }
}

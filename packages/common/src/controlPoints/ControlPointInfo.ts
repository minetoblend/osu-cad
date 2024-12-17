import type { ControlPoint } from './ControlPoint';
import type { ControlPointGroupChangeEvent } from './ControlPointGroup';
import { Action } from 'osucad-framework';
import { ControlPointGroup } from './ControlPointGroup';
import { ControlPointList } from './ControlPointList';
import { DifficultyPoint } from './DifficultyPoint';
import { EffectPoint } from './EffectPoint';
import { SamplePoint } from './SamplePoint';
import { TickGenerator } from './TickGenerator';
import { TimingPoint } from './TimingPoint';

export class ControlPointInfo {
  groups = new ControlPointList<ControlPointGroup>();

  timingPoints = new ControlPointList<TimingPoint>();

  difficultyPoints = new ControlPointList<DifficultyPoint>();

  effectPoints = new ControlPointList<EffectPoint>(false);

  samplePoints = new ControlPointList<SamplePoint>();

  groupAdded = new Action<ControlPointGroup>();

  groupRemoved = new Action<ControlPointGroup>();

  anyPointChanged = new Action<ControlPoint>();

  #idMap = new Map<string, ControlPointGroup>();

  constructor() {
    this.groups.added.addListener(this.#onGroupAdded, this);
    this.groups.removed.addListener(this.#onGroupRemoved, this);
  }

  add(controlPoint: ControlPointGroup): boolean {
    if (this.groups.find(it => it.id === controlPoint.id))
      return false;

    this.groups.add(controlPoint);
    return true;
  }

  remove(controlPoint: ControlPointGroup): boolean {
    return this.groups.remove(controlPoint);
  }

  controlPointGroupAtTime(time: number, create: true): ControlPointGroup;

  controlPointGroupAtTime(time: number, create?: false): ControlPointGroup | undefined;

  controlPointGroupAtTime(time: number, create: boolean = false): ControlPointGroup | undefined {
    const controlPoint = new ControlPointGroup();
    controlPoint.time = time;

    const index = this.groups.findIndex(it => it.time === time);

    if (index >= 0) {
      return this.groups.get(index)!;
    }

    if (create) {
      this.add(controlPoint);

      return controlPoint;
    }

    return undefined;
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

  #onGroupAdded(group: ControlPointGroup) {
    this.#idMap.set(group.id, group);

    this.groupAdded.emit(group);

    group.added.addListener(e => this.#onAddedToGroup(e));
    group.removed.addListener(e => this.#onRemovedFromGroup(e));

    for (const child of group.children) {
      this.#onAddedToGroup({ group, controlPoint: child });
    }

    group.changed.addListener(this.#onAnyPointChanged, this);

    this.#onAnyPointChanged(group);
  }

  #onAnyPointChanged(child: ControlPoint) {
    this.anyPointChanged.emit(child);
  }

  #onGroupRemoved(group: ControlPointGroup) {
    this.#idMap.delete(group.id);

    this.groupRemoved.emit(group);

    for (const child of group.children) {
      this.#onRemovedFromGroup({ group, controlPoint: child });
    }

    group.changed.removeListener(this.#onAnyPointChanged);
  }

  #onAddedToGroup = (event: ControlPointGroupChangeEvent) => {
    const controlPoint = event.controlPoint;

    this.listFor(controlPoint)?.add(controlPoint);
  };

  #onRemovedFromGroup = (event: ControlPointGroupChangeEvent) => {
    const controlPoint = event.controlPoint;

    this.listFor(controlPoint)?.remove(controlPoint);
  };

  addToGroup(group: ControlPointGroup, controlPoint: ControlPoint, skipIfRedundant: boolean): boolean {
    if (skipIfRedundant) {
      const existing = this.listFor(controlPoint)?.controlPointAt(group.time);

      if (controlPoint instanceof EffectPoint) {
        this.listFor(controlPoint)?.controlPointAt(group.time);
      }

      if (existing && controlPoint.isRedundant(existing))
        return false;
    }

    return group.add(controlPoint);
  }

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
      case ControlPointGroup:
        return undefined;
      default:
        throw new Error(`Unknown control point type: ${controlPoint.constructor.name}`);
    }
  }

  getById(id: string) {
    return this.#idMap.get(id);
  }
}

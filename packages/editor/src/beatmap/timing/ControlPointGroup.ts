import { Action } from 'osucad-framework';
import { objectId } from '../ObjectId';
import { ControlPoint } from './ControlPoint';
import { DifficultyPoint } from './DifficultyPoint';
import { EffectPoint } from './EffectPoint';
import { SamplePoint } from './SamplePoint';
import { TimingPoint } from './TimingPoint';

export interface ControlPointGroupChangeEvent {
  group: ControlPointGroup;
  controlPoint: ControlPoint;
}

export class ControlPointGroup extends ControlPoint {
  id = objectId();

  constructor(startTime = 0) {
    super();

    this.time = startTime;
  }

  get time() {
    return super.time;
  }

  set time(value) {
    if (this.time === value)
      return;

    super.time = value;

    for (const child of this.children)
      child.time = value;
  }

  deepClone(): ControlPointGroup {
    const clone = new ControlPointGroup(this.time);

    clone.copyFrom(this);

    return clone;
  }

  #children = new Set<ControlPoint>();

  get children(): ReadonlySet<ControlPoint> {
    return this.#children;
  }

  copyFrom(other: this) {
    super.copyFrom(other);

    for (const child of other.children) {
      this.add(child.deepClone());
    }
  }

  added = new Action<ControlPointGroupChangeEvent>();

  removed = new Action<ControlPointGroupChangeEvent>();

  add(controlPoint: ControlPoint): boolean {
    if (this.#children.has(controlPoint))
      return false;

    for (const child of this.#children) {
      if (child.constructor === controlPoint.constructor) {
        this.remove(child);
        break;
      }
    }

    controlPoint.timeBindable.bindTo(this.timeBindable);

    this.#children.add(controlPoint);

    if (controlPoint instanceof TimingPoint)
      this.timing = controlPoint;
    else if (controlPoint instanceof DifficultyPoint)
      this.difficulty = controlPoint;
    else if (controlPoint instanceof SamplePoint)
      this.sample = controlPoint;
    else if (controlPoint instanceof EffectPoint)
      this.effect = controlPoint;

    controlPoint.changed.addListener(this.raiseChanged, this);

    this.added.emit({ group: this, controlPoint });

    this.raiseChanged();

    return true;
  }

  timing: TimingPoint | null = null;

  difficulty: DifficultyPoint | null = null;

  sample: SamplePoint | null = null;

  effect: EffectPoint | null = null;

  remove(controlPoint: ControlPoint): boolean {
    if (!this.#children.delete(controlPoint))
      return false;

    if (controlPoint === this.timing)
      this.timing = null;
    else if (controlPoint === this.difficulty)
      this.difficulty = null;
    else if (controlPoint === this.sample)
      this.sample = null;

    controlPoint.changed.removeListener(this.raiseChanged, this);

    controlPoint.timeBindable.unbindFrom(this.timeBindable);

    this.removed.emit({ group: this, controlPoint });

    this.raiseChanged();

    return true;
  }

  isRedundant(existing?: ControlPoint): boolean {
    if (!existing)
      return false;
    if (!(existing instanceof ControlPointGroup))
      return false;

    return this.time === existing.time;
  }
}

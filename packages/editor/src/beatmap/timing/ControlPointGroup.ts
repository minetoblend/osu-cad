import type { CommandContext } from '../../editor/commands/CommandContext.ts';
import type { Patchable } from '../../editor/commands/Patchable.ts';
import type { DifficultyPointPatch } from './DifficultyPoint';
import { Action } from 'osucad-framework';
import { objectId } from '../ObjectId';
import { ControlPoint } from './ControlPoint';
import { DifficultyPoint } from './DifficultyPoint';
import { EffectPoint, type EffectPointPatch } from './EffectPoint';
import { SamplePoint, type SamplePointPatch } from './SamplePoint';
import { TimingPoint, type TimingPointPatch } from './TimingPoint';

export interface ControlPointGroupChangeEvent {
  group: ControlPointGroup;
  controlPoint: ControlPoint;
}

export interface ControlPointGroupPatch {
  time: number;
  timing: Partial<TimingPointPatch> | null;
  sample: Partial<SamplePointPatch> | null;
  effect: Partial<EffectPointPatch> | null;
  difficulty: Partial<DifficultyPointPatch> | null;
}

export type PatchFor<T> = T extends Patchable<infer U> ? U : never;

export class ControlPointGroup extends ControlPoint implements Patchable<ControlPointGroupPatch> {
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

    for (const child of other.children)
      this.add(child.deepClone());
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
    controlPoint.group = this;

    this.#children.add(controlPoint);

    if (controlPoint instanceof TimingPoint)
      this.timing = controlPoint;
    else if (controlPoint instanceof DifficultyPoint)
      this.difficulty = controlPoint;
    else if (controlPoint instanceof SamplePoint)
      this.sample = controlPoint;
    else if (controlPoint instanceof EffectPoint)
      this.effect = controlPoint;

    controlPoint.changed.addListener(this.#childChanged, this);

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

    controlPoint.changed.removeListener(this.#childChanged, this);

    controlPoint.timeBindable.unbindFrom(this.timeBindable);

    controlPoint.group = null;

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

  #childChanged(child: ControlPoint) {
    return this.changed.emit(child);
  }

  applyPatch(patch: Partial<ControlPointGroupPatch>, ctx: CommandContext) {
    if (patch.time !== undefined)
      this.time = patch.time;

    this.#applyChildPatch('timing', patch.timing, ctx);
    this.#applyChildPatch('sample', patch.sample, ctx);
    this.#applyChildPatch('effect', patch.effect, ctx);
    this.#applyChildPatch('difficulty', patch.difficulty, ctx);
  }

  #applyChildPatch<K extends keyof ControlPointGroup>(key: K, patch: Partial<PatchFor<ControlPointGroup[K]>> | null | undefined, ctx: CommandContext) {
    if (patch === undefined)
      return null;
    let child = this[key] as Patchable<PatchFor<ControlPointGroup[K]>> | null;

    if (patch === null) {
      if (child)
        this.remove(child as unknown as ControlPoint);
      return;
    }

    if (!child)
      this.add(child = this.#createChild(key as any, ctx) as any);

    child!.applyPatch(patch!, ctx);
  }

  #createChild(
    type: 'timing' | 'sample' | 'difficulty' | 'effect',
    ctx: CommandContext,
  ) {
    switch (type) {
      case 'timing':
        return ctx.controlPoints.timingPointAt(this.time).deepClone();
      case 'sample':
        return ctx.controlPoints.samplePointAt(this.time).deepClone();
      case 'difficulty':
        return ctx.controlPoints.difficultyPointAt(this.time).deepClone();
      case 'effect':
        return ctx.controlPoints.effectPointAt(this.time).deepClone();
    }
  }

  asPatch(): ControlPointGroupPatch {
    return {
      time: this.time,
      timing: this.timing?.asPatch() ?? null,
      sample: this.sample?.asPatch() ?? null,
      effect: this.effect?.asPatch() ?? null,
      difficulty: this.difficulty?.asPatch() ?? null,
    };
  }
}

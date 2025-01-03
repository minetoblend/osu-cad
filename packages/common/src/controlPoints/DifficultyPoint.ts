import type { CommandContext } from '../commands/CommandContext';
import type { Patchable } from '../commands/Patchable';
import type { Property } from '../crdt/Property';
import { PatchUtils } from '../commands/PatchUtils';
import { ControlPoint } from './ControlPoint';

export interface DifficultyPointPatch {
  sliderVelocity: number;
}

export class DifficultyPoint extends ControlPoint implements Patchable<DifficultyPointPatch> {
  constructor(time: number, sliderVelocity: number = 1) {
    super(time);

    this.#sliderVelocity = this.property('sliderVelocity', sliderVelocity);
  }

  static default = new DifficultyPoint(1);

  override get controlPointName(): string {
    return 'Difficulty Point';
  }

  readonly #sliderVelocity: Property<number>;

  get sliderVelocityBindable() {
    return this.#sliderVelocity.bindable;
  }

  get sliderVelocity() {
    return this.#sliderVelocity.value;
  }

  set sliderVelocity(value: number) {
    this.#sliderVelocity.value = value;
  }

  isRedundant(existing?: ControlPoint): boolean {
    if (!existing)
      return false;

    if (!(existing instanceof DifficultyPoint))
      return false;

    return this.sliderVelocity === existing.sliderVelocity;
  }

  deepClone(): DifficultyPoint {
    const clone = new DifficultyPoint(this.time);
    clone.copyFrom(this);
    return clone;
  }

  override copyFrom(other: this) {
    super.copyFrom(other);

    this.sliderVelocity = other.sliderVelocity;
  }

  applyPatch(patch: Partial<DifficultyPointPatch>, ctx: CommandContext) {
    PatchUtils.applyPatch(patch, this);
  }

  asPatch(): DifficultyPointPatch {
    return {
      sliderVelocity: this.sliderVelocity,
    };
  }
}

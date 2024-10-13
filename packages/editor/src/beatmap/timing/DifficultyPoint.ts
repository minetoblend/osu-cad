import type { CommandContext } from '../../editor/commands/CommandContext';
import type { Patchable } from '../../editor/commands/Patchable';
import { BindableNumber } from 'osucad-framework';
import { PatchUtils } from '../../editor/commands/PatchUtils';
import { ControlPoint } from './ControlPoint';

export interface DifficultyPointPatch {
  sliderVelocity: number;
}

export class DifficultyPoint extends ControlPoint implements Patchable<DifficultyPointPatch> {
  constructor(sliderVelocity: number = 1) {
    super();

    this.sliderVelocityBindable.value = sliderVelocity;

    this.sliderVelocityBindable.valueChanged.addListener(this.raiseChanged, this);
  }

  static default = new DifficultyPoint(1);

  sliderVelocityBindable = new BindableNumber(1).withRange(0.1, 10).withPrecision(0.01);

  get sliderVelocity() {
    return this.sliderVelocityBindable.value;
  }

  set sliderVelocity(value: number) {
    this.sliderVelocityBindable.value = value;
  }

  isRedundant(existing?: ControlPoint): boolean {
    if (!existing)
      return false;

    if (!(existing instanceof DifficultyPoint))
      return false;

    return this.sliderVelocity === existing.sliderVelocity;
  }

  deepClone(): DifficultyPoint {
    const clone = new DifficultyPoint();
    clone.copyFrom(this);
    return clone;
  }

  copyFrom(other: this) {
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

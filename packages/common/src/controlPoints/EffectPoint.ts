import type { Patchable } from '../commands/Patchable';
import { PatchUtils } from '../commands/PatchUtils';
import { ControlPoint } from './ControlPoint';

export interface EffectPointPatch {
  kiaiMode?: boolean;
}

export class EffectPoint extends ControlPoint implements Patchable<EffectPointPatch> {
  constructor(kiaiMode: boolean = false) {
    super();

    this.#kiaiMode = kiaiMode;
  }

  static default = new EffectPoint();

  #kiaiMode: boolean;

  get kiaiMode() {
    return this.#kiaiMode;
  }

  set kiaiMode(value: boolean) {
    if (value === this.#kiaiMode)
      return;

    this.#kiaiMode = value;
    this.raiseChanged();
  }

  isRedundant(existing?: ControlPoint | undefined): boolean {
    if (!existing)
      return false;

    if (!(existing instanceof EffectPoint))
      return false;

    return this.kiaiMode === existing.kiaiMode;
  }

  deepClone(): EffectPoint {
    const clone = new EffectPoint();
    clone.copyFrom(this);
    return clone;
  }

  override copyFrom(other: this) {
    super.copyFrom(other);

    this.kiaiMode = other.kiaiMode;
  }

  applyPatch(patch: Partial<EffectPointPatch>) {
    PatchUtils.applyPatch(patch, this);
  }

  asPatch(): EffectPointPatch {
    return {
      kiaiMode: this.kiaiMode,
    };
  }
}

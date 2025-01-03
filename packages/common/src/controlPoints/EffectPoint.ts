import type { Patchable } from '../commands/Patchable';
import type { Property } from '../crdt/Property';
import { PatchUtils } from '../commands/PatchUtils';
import { ControlPoint } from './ControlPoint';

export interface EffectPointPatch {
  kiaiMode?: boolean;
}

export class EffectPoint extends ControlPoint implements Patchable<EffectPointPatch> {
  constructor(time: number, kiaiMode: boolean = false) {
    super(time);

    this.#kiaiMode = this.property('kiaiMode', kiaiMode);
  }

  static default = new EffectPoint(0);

  override get controlPointName(): string {
    return 'Effect Point';
  }

  #kiaiMode: Property<boolean>;

  get kiaiModeBindable() {
    return this.#kiaiMode.bindable;
  }

  get kiaiMode() {
    return this.#kiaiMode.value;
  }

  set kiaiMode(value: boolean) {
    this.#kiaiMode.value = value;
  }

  isRedundant(existing?: ControlPoint | undefined): boolean {
    if (!existing && !this.kiaiMode)
      return true;

    if (!existing)
      return false;

    if (!(existing instanceof EffectPoint))
      return false;

    return this.kiaiMode === existing.kiaiMode;
  }

  deepClone(): EffectPoint {
    const clone = new EffectPoint(this.time);
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

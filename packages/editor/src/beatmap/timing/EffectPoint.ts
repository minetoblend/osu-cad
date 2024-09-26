import { ControlPoint } from './ControlPoint';

export class EffectPoint extends ControlPoint {
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

  copyFrom(other: this) {
    super.copyFrom(other);

    this.kiaiMode = other.kiaiMode;
  }
}

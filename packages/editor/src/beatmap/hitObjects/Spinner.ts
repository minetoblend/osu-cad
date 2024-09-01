import { Vec2 } from 'osucad-framework';
import type { IPatchable } from '../../editor/commands/IPatchable';
import type { SerializedSpinner } from '../serialization/HitObjects';
import { SpinnerPatchEncoder } from '../../editor/commands/patchEncoder/SpinnerPatchEncoder';
import { OsuHitObject } from './OsuHitObject';

export class Spinner extends OsuHitObject implements IPatchable<SerializedSpinner> {
  #duration = 0;

  override get duration() {
    return this.#duration;
  }

  override set duration(value: number) {
    this.#duration = value;
  }

  get endTime() {
    return this.startTime + this.duration;
  }

  set endTime(value: number) {
    this.duration = value - this.startTime;
  }

  get stackOffset() {
    return Vec2.zero();
  }

  applyPatch(patch: Partial<SerializedSpinner>) {
    super.applyPatch(patch);

    if (patch.duration !== undefined)
      this.duration = patch.duration;
  }

  createPatchEncoder() {
    return new SpinnerPatchEncoder(this);
  }

  isSpinner(): this is Spinner {
    return true;
  }
}

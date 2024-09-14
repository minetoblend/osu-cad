import { HitObject, HitObjectType } from './hitObject';
import { SerializedSpinner } from '../types';
import { Vec2 } from 'osucad-framework';
import { HitSample } from './hitSound';

const spinnerPosition = new Vec2(256, 192);

export class Spinner extends HitObject {
  constructor(options?: SerializedSpinner) {
    super(options);
    if (options) {
      this.duration = options.duration;
    }
  }

  readonly type = HitObjectType.Spinner;

  private _duration = 0;

  get duration() {
    return this._duration;
  }

  set duration(value: number) {
    if (value === this._duration) return;
    this._duration = value;
    this.onUpdate.emit('duration');
  }

  serialize(): SerializedSpinner {
    return {
      id: this.id,
      type: 'spinner',
      position: this.position,
      newCombo: this.isNewCombo,
      attribution: this.attribution,
      startTime: this.startTime,
      duration: this.duration,
      comboOffset: this.comboOffset,
      hitSound: { ...this._hitSound },
    };
  }

  contains(point: Vec2): boolean {
    return Vec2.closerThan(point, spinnerPosition, 128);
  }

  override get position() {
    return spinnerPosition;
  }

  override set position(value: Vec2) {
    // we ignore this
  }

  override get isNewCombo() {
    return true;
  }

  override set isNewCombo(value: boolean) {
    // we ignore this
  }

  override patch(update: Partial<SerializedSpinner>) {
    super.patch(update);
    if (update.duration !== undefined) this.duration = update.duration;
  }

  override calculateHitSamples(): HitSample[] {
    return [];
  }
}

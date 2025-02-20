import { ConvertHitObject } from './ConvertHitObject';

export class ConvertHoldNote extends ConvertHitObject {
  #duration: number = 0;

  override get duration() {
    return this.#duration;
  }

  override set duration(value) {
    this.#duration = value;
  }

  override get endTime() {
    return this.startTime + this.duration;
  }

  override set endTime(value) {
    this.#duration = value - this.startTime;
  }
}

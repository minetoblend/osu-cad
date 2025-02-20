import { ConvertHitObject } from './ConvertHitObject';

export class ConvertSpinner extends ConvertHitObject {
  #duration: number = 0;

  override get duration() {
    return this.#duration;
  }

  override set duration(value) {
    this.#duration = value;
  }
}

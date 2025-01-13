import { ConvertHitObject } from './ConvertHitObject';

export class ConvertSpinner extends ConvertHitObject {
  #duraton: number = 0;

  override get duration() {
    return this.#duraton;
  }

  override set duration(value) {
    this.#duraton = value;
  }
}

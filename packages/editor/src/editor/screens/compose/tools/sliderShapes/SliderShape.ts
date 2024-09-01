import { CompositeDrawable, Vec2 } from 'osucad-framework';
import type { PathPoint } from '../../../../../beatmap/hitObjects/PathPoint';

export abstract class SliderShape extends CompositeDrawable {
  protected constructor() {
    super();
  }

  #startPosition = new Vec2();

  get startPosition() {
    return this.#startPosition;
  }

  set startPosition(value: Vec2) {
    this.#startPosition = value;
  }

  #endPosition = new Vec2();

  get endPosition() {
    return this.#endPosition;
  }

  set endPosition(value: Vec2) {
    this.#endPosition = value;
  }

  abstract createPathPoints(): PathPoint[];

  abstract setPosition(index: number, position: Vec2): void;
}

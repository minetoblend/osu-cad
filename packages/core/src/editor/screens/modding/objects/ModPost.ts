import type { ModPostObject } from './ModPostObject';
import { Action } from '@osucad/framework';

export class ModPost {
  readonly added = new Action<ModPostObject>();

  readonly removed = new Action<ModPostObject>();

  readonly #objects: ModPostObject[] = [];

  get objects(): readonly ModPostObject[] {
    return this.#objects;
  }

  add(object: ModPostObject) {
    this.#objects.push(object);
    this.added.emit(object);
  }

  remove(object: ModPostObject) {
    const index = this.#objects.indexOf(object);
    if (index >= 0) {
      this.#objects.splice(index, 1);
      this.removed.emit(object);
      return true;
    }

    return false;
  }
}

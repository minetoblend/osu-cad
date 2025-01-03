import type { ModPostBlueprint } from './ModPostBlueprint';
import { Bindable, Vec2 } from 'osucad-framework';

export abstract class ModPostObject {
  readonly positionBindable = new Bindable(new Vec2());

  get position() {
    return this.positionBindable.value;
  }

  set position(value) {
    this.positionBindable.value = value;
  }

  abstract createBlueprint(): ModPostBlueprint;
}

import type { ModPostBlueprint } from './ModPostBlueprint';
import { Bindable, BindableBoolean, Vec2 } from '@osucad/framework';
import { Color } from 'pixi.js';
import { ModPostLineBlueprint } from './ModPostLineBlueprint';
import { ModPostObject } from './ModPostObject';

export class ModPostLine extends ModPostObject {
  readonly startPositionBindable = new Bindable(new Vec2());

  get startPosition() {
    return this.startPositionBindable.value;
  }

  set startPosition(value) {
    this.startPositionBindable.value = value;
  }

  readonly endPositionBindable = new Bindable(new Vec2());

  get endPosition() {
    return this.endPositionBindable.value;
  }

  set endPosition(value) {
    this.endPositionBindable.value = value;
  }

  readonly colorBindable = new Bindable(new Color(0xFFFFFF));

  get color() {
    return this.colorBindable.value;
  }

  set color(value) {
    this.colorBindable.value = value;
  }

  readonly showDistanceBindable = new BindableBoolean();

  get showDistance() {
    return this.showDistanceBindable.value;
  }

  set showDistance(value) {
    this.showDistanceBindable.value = value;
  }

  override createBlueprint(): ModPostBlueprint {
    return new ModPostLineBlueprint(this);
  }
}

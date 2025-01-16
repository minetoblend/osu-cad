import type { StrokePoint } from '../../../../drawables/BrushStrokeGeometry';
import type { ModPostBlueprint } from './ModPostBlueprint';
import { Action, Bindable } from '@osucad/framework';
import { Color } from 'pixi.js';
import { ModPostDrawingBlueprint } from './ModPostDrawingBlueprint';
import { ModPostObject } from './ModPostObject';

export class ModPostDrawing extends ModPostObject {
  pathUpdated = new Action();

  #path: StrokePoint[] = [];

  get path() {
    return this.#path;
  }

  set path(value) {
    this.#path = value;
    this.pathUpdated.emit();
  }

  updatePath() {
    this.pathUpdated.emit();
  }

  readonly colorBindable = new Bindable(new Color(0xFFFFFF));

  get color() {
    return this.colorBindable.value;
  }

  set color(value) {
    this.colorBindable.value = value;
  }

  override createBlueprint(): ModPostBlueprint {
    return new ModPostDrawingBlueprint(this);
  }
}

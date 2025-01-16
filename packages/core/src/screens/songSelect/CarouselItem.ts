import { Action, Bindable } from '@osucad/framework';

export abstract class CarouselItem {
  carouselYPosition: number = 0;

  abstract get totalHeight(): number;

  selected = new Bindable(false);

  visible = new Bindable(true);

  invalidated = new Action();
}

import type { Drawable } from '../drawables/Drawable';
import { Container } from './Container';

export class CircularContainer<T extends Drawable = Drawable> extends Container<T> {
  override update() {
    super.update();

    this.cornerRadius = Math.min(this.drawWidth, this.drawHeight) / 2;
  }
}

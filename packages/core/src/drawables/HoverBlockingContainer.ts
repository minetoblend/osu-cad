import type { Drawable, HoverEvent } from '@osucad/framework';
import { Container } from '@osucad/framework';

export class HoverBlockingContainer<T extends Drawable = Drawable> extends Container<T> {
  override onHover(e: HoverEvent): boolean {
    return true;
  }
}

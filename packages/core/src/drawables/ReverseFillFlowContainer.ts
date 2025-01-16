import { type Drawable, FillFlowContainer } from '@osucad/framework';

export class ReverseFillFlowContainer<T extends Drawable = Drawable> extends FillFlowContainer {
  override compare(a: Drawable, b: Drawable): number {
    const i = b.depth - a.depth;
    if (i !== 0)
      return i;

    return b.childId - a.childId;
  }
}

import type { Drawable } from 'osucad-framework';
import { Axes, Direction, EasingFunction, RoundedBox, ScrollbarContainer, ScrollContainer, Vec2 } from 'osucad-framework';

export class MainScrollContainer<T extends Drawable = Drawable> extends ScrollContainer<T> {
  constructor(direction: Direction = Direction.Vertical) {
    super(direction);
  }

  protected override createScrollbar(direction: Direction): ScrollbarContainer {
    return new BasicScrollbar(direction);
  }
}

const dim_size = 8;

class BasicScrollbar extends ScrollbarContainer {
  constructor(direction: Direction) {
    super(direction);

    // this.alpha = 0;

    this.child = new RoundedBox({
      relativeSizeAxes: Axes.Both,
      cornerRadius: 2,
      alpha: 0.125,
    });
  }

  override resizeScrollbarTo(
    val: number,
    duration: number = 0,
    easing: EasingFunction = EasingFunction.None,
  ): void {
    let size: Vec2;
    if (this.scrollDirection === Direction.Vertical) {
      size = new Vec2(dim_size, val);
    }
    else {
      size = new Vec2(val, dim_size);
    }

    if (duration === 0 || easing === EasingFunction.None) {
      this.size = size;
      return;
    }

    this.resizeTo(size, duration, easing);
  }
}

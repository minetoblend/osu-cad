import type { Drawable } from 'osucad-framework';
import { Axes, Direction, RoundedBox, ScrollContainer, ScrollbarContainer, Vec2 } from 'osucad-framework';
import gsap from 'gsap';

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

    this.alpha = 0;

    this.child = new RoundedBox({
      relativeSizeAxes: Axes.Both,
      cornerRadius: 2,
      alpha: 0.125,
    });
  }

  override resizeTo(
    val: number,
    duration: number = 0,
    easing: gsap.EaseFunction | gsap.EaseString = 'none',
  ): void {
    let size: Vec2;
    if (this.scrollDirection === Direction.Vertical) {
      size = new Vec2(dim_size, val);
    }
    else {
      size = new Vec2(val, dim_size);
    }

    if (duration === 0 || easing === 'none') {
      this.size = size;
      return;
    }

    gsap.to(this, {
      width: size.x,
      height: size.y,
      duration: duration / 1000,
      ease: easing,
    });
  }
}

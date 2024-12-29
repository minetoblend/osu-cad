import { Vec2 } from '../../math';
import { Axes, Direction } from '../drawables';
import { Box } from '../shapes';
import { EasingFunction } from '../transforms/EasingFunction';
import { ScrollbarContainer, ScrollContainer } from './ScrollContainer';

export class BasicScrollContainer extends ScrollContainer {
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

    this.child = new Box({
      relativeSizeAxes: Axes.Both,
      color: 'rgb(128, 164, 108)',
    });
  }

  override resizeScrollbarTo(val: number, duration: number = 0, easing: EasingFunction = EasingFunction.Default): void {
    let size: Vec2;
    if (this.scrollDirection === Direction.Vertical) {
      size = new Vec2(dim_size, val);
    }
    else {
      size = new Vec2(val, dim_size);
    }

    if (duration === 0) {
      this.size = size;
      return;
    }

    this.resizeTo(size, duration, easing);
  }
}

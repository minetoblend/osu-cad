import type { Drawable, HoverEvent, HoverLostEvent, MouseDownEvent, MouseMoveEvent, MouseUpEvent, UIEvent } from 'osucad-framework';
import { Axes, Direction, EasingFunction, MouseButton, RoundedBox, ScrollbarContainer, ScrollContainer, Vec2 } from 'osucad-framework';

export class OsucadScrollContainer<T extends Drawable = Drawable> extends ScrollContainer<T> {
  constructor(direction: Direction = Direction.Vertical) {
    super(direction);
  }

  protected override createScrollbar(direction: Direction): ScrollbarContainer {
    return new BasicScrollbar(direction);
  }

  #rightClickScroll = false;

  get rightClickScroll(): boolean {
    return this.#rightClickScroll;
  }

  set rightClickScroll(value: boolean) {
    this.#rightClickScroll = value;
  }

  override onMouseDown(e: MouseDownEvent): boolean {
    if (e.button === MouseButton.Right && this.rightClickScroll) {
      this.#beginRightClickScroll(e);
      return true;
    }

    return super.onMouseDown(e);
  }

  override onMouseMove(e: MouseMoveEvent): boolean {
    if (this.#isRightClickScrolling) {
      this.#updateRightClickScrollPosition(e);
      return true;
    }

    return super.onMouseMove?.(e) ?? false;
  }

  override onMouseUp(e: MouseUpEvent) {
    if (this.#isRightClickScrolling && e.button === MouseButton.Right) {
      this.#endRightClickScroll();
    }

    super.onMouseUp?.(e);
  }

  #isRightClickScrolling = false;

  #beginRightClickScroll(e: MouseDownEvent) {
    this.#isRightClickScrolling = true;
    this.#updateRightClickScrollPosition(e);
  }

  #updateRightClickScrollPosition(e: UIEvent) {
    const position = e.mousePosition.y / this.drawSize.y;

    this.target = position * this.scrollableExtent;
  }

  #endRightClickScroll() {
    this.#isRightClickScrolling = false;
  }
}

const dim_size = 8;

class BasicScrollbar extends ScrollbarContainer {
  constructor(direction: Direction) {
    super(direction);

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

  override onHover(e: HoverEvent): boolean {
    this.child.fadeTo(0.3, 100);
    return true;
  }

  override onHoverLost(e: HoverLostEvent) {
    this.child.fadeTo(0.125, 100);
  }
}

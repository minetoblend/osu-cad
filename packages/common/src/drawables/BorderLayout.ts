import type { Drawable, DrawableOptions } from 'osucad-framework';
import { Anchor, Axes, CompositeDrawable, Container, Direction, EmptyDrawable, Invalidation, LayoutMember, MarginPadding } from 'osucad-framework';

export interface BorderLayoutOptions extends DrawableOptions {
  center?: Drawable;
  north?: Drawable;
  south?: Drawable;
  east?: Drawable;
  west?: Drawable;
}

export class BorderLayout extends CompositeDrawable {
  constructor(options: BorderLayoutOptions = {}) {
    super();

    this.relativeSizeAxes = Axes.Both;

    const {
      center = new EmptyDrawable(),
      north = new EmptyDrawable(),
      south = new EmptyDrawable(),
      west = new EmptyDrawable(),
      east = new EmptyDrawable(),
      ...rest
    } = options;

    this.addLayout(this.#layoutBacking);

    this.addAllInternal(
      this.#center = new Container({
        relativeSizeAxes: Axes.Both,
        child: center,
      }),
      this.#west = new Container({
        relativeSizeAxes: Axes.Y,
        autoSizeAxes: Axes.X,
        child: west,
      }),
      this.#east = new Container({
        relativeSizeAxes: Axes.Y,
        autoSizeAxes: Axes.X,
        anchor: Anchor.TopRight,
        origin: Anchor.TopRight,
        child: east,
      }),
      this.#north = new Container({
        relativeSizeAxes: Axes.X,
        autoSizeAxes: Axes.Y,
        child: north,
      }),
      this.#south = new Container({
        relativeSizeAxes: Axes.X,
        autoSizeAxes: Axes.Y,
        child: south,
        anchor: Anchor.BottomLeft,
        origin: Anchor.BottomLeft,
      }),
    );

    this.with(rest);
  }

  get center() {
    return this.#center.child;
  }

  set center(value) {
    this.#center.child = value;
  }

  get north() {
    return this.#north.child;
  }

  set north(value) {
    this.#north.child = value;
  }

  get south() {
    return this.#south.child;
  }

  set south(value) {
    this.#north.child = value;
  }

  get east() {
    return this.#east.child;
  }

  set east(value) {
    this.#east.child = value;
  }

  get west() {
    return this.#west.child;
  }

  set west(value) {
    this.#west.child = value;
  }

  readonly #center: Container;

  readonly #north: Container;

  readonly #south: Container;

  readonly #east: Container;

  readonly #west: Container;

  readonly #layoutBacking = new LayoutMember(Invalidation.DrawSize);

  override update() {
    super.update();

    if (!this.#layoutBacking.isValid) {
      this.#updateLayout();
    }
  }

  #layoutPriority: Direction = Direction.Vertical;

  get layoutPriority() {
    return this.#layoutPriority;
  }

  set layoutPriority(value) {
    if (value === this.layoutPriority)
      return;

    this.#layoutPriority = value;
    this.#layoutBacking.invalidate();
  }

  #updateLayout() {
    const padding = new MarginPadding({
      top: this.north.drawHeight,
      bottom: this.south.drawHeight,
      left: this.west.drawWidth,
      right: this.east.drawWidth,
    });

    if (this.layoutPriority === Direction.Vertical) {
      this.#east.padding = this.#west.padding = {
        top: padding.top,
        bottom: padding.bottom,
      };
    }
    else {
      this.#north.padding = this.#south.padding = {
        left: padding.left,
        right: padding.right,
      };
    }

    this.#center.padding = padding;

    this.#layoutBacking.validate();
  }
}

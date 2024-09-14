import { Axes, Container, dependencyLoader, Drawable, PoolableDrawable } from 'osucad-framework';
import type { CarouselItem } from './CarouselItem';

export class DrawableCarouselItem extends PoolableDrawable {
  constructor(item?: CarouselItem) {
    super();

    this.relativeSizeAxes = Axes.X;

    this.addInternal(
      this.movementContainer = new Container({
        relativeSizeAxes: Axes.Both,
        children: [
          this.header = new CarouselHeader(),
          this.#content = new Container({
            relativeSizeAxes: Axes.X,
          }),
        ],
      }),
    );

    if (item)
      this.item = item;
  }

  #item: CarouselItem | null = null;

  get item() : CarouselItem {
    return this.#item!;
  }

  set item(value: CarouselItem | null) {
    this.#item = value;
  }

  protected prepareForUse() {
    this.item.selected.valueChanged.addListener(this.applyState, this);
    this.applyState();
  }

  protected freeAfterUse() {
    this.item.selected.valueChanged.removeListener(this.applyState);
  }


  @dependencyLoader()
  [Symbol('load')]() {

  }

  readonly header: CarouselHeader;

  protected movementContainer: Container;

  readonly #content: Container;

  get content() {
    return this.#content;
  }

  add(drawable: Drawable) {
    this.#content.add(drawable);
  }

  protected applyState() {
    this.height = this.item.totalHeight;

    if (this.item.selected.value)
      this.selected();
    else
      this.deselected();
  };

  protected selected() {}

  protected deselected() {}

  onClick(): boolean {
    this.item.selected.value = true;

    return true;
  }
}

class CarouselHeader extends Container {
  constructor() {
    super({
      relativeSizeAxes: Axes.X,
      height: 80,
    });
  }
}

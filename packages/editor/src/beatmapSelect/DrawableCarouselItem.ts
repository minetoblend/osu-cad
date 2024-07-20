import { Axes, Container, dependencyLoader } from 'osucad-framework';
import type { CarouselItem } from './CarouselItem';

export class DrawableCarouselItem extends Container {
  constructor(readonly item: CarouselItem) {
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
  }

  @dependencyLoader()
  [Symbol('load')]() {
    this.item.selected.addOnChangeListener(
      () => {
        this.applyState();
      },
      { immediate: true },
    );
  }

  readonly header: CarouselHeader;

  protected movementContainer: Container;

  #content: Container;

  get content() {
    return this.#content;
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

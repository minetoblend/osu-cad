import type { ColorSource } from 'pixi.js';
import { Axes, BindableNumber, CompositeDrawable, Container, dependencyLoader, provide, resolved, Vec2 } from '@osucad/framework';
import { LayeredTimeline } from './LayeredTimeline';

@provide(TimelineLayer)
export abstract class TimelineLayer extends Container {
  protected constructor(readonly title: string) {
    super();

    this.addAllInternal(
      this.#content = new Container({
        relativeSizeAxes: Axes.Both,
      }),
      this.#headerContainer = new Container({
        relativeSizeAxes: Axes.Y,
        padding: { vertical: 1, left: 1 },
      }),
    );
  }

  abstract get layerColor(): ColorSource;

  @resolved(LayeredTimeline)
  timeline!: LayeredTimeline;

  header!: TimelineLayerHeader;

  override get content() {
    return this.#content;
  }

  readonly #content!: Container;

  #headerContainer!: Container;

  headerWidth = new BindableNumber(0);

  @dependencyLoader()
  [Symbol('load')]() {
    this.relativeSizeAxes = Axes.X;
    this.height = 60;

    this.headerWidth.bindTo(this.timeline.headerWidth);

    this.header = this.createHeader();
    this.loadComponent(this.header);

    this.timeline.headerContainer.add(this.#headerContainer = new Container({
      child: this.header,
    }));

    this.#updateLayout();
  }

  #updateLayout() {
    this.#headerContainer.width = this.headerWidth.value;
  }

  protected createHeader() {
    return new TimelineLayerHeader(this.title, this.layerColor);
  }

  override update() {
    super.update();

    const quad = this.screenSpaceDrawQuad;

    this.#headerContainer.y = this.#headerContainer.parent!.toLocalSpace(quad.topLeft).y;
    this.#headerContainer.size = new Vec2(this.headerWidth.value, this.drawHeight);
  }
}

export class TimelineLayerHeader extends CompositeDrawable {
  constructor(readonly title: string, readonly layerColor: ColorSource) {
    super();

    this.relativeSizeAxes = Axes.Both;
  }
}

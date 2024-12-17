import type { ColorSource } from 'pixi.js';
import {
  Axes,
  BindableNumber,
  CompositeDrawable,
  Container,
  dependencyLoader,
  ProxyContainer,
  resolved,
} from 'osucad-framework';
import { LayeredTimeline } from './LayeredTimeline';

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

  #content!: Container;

  #headerContainer!: Container;

  headerWidth = new BindableNumber(0);

  @dependencyLoader()
  [Symbol('load')]() {
    this.relativeSizeAxes = Axes.X;
    this.height = 60;

    this.headerWidth.bindTo(this.timeline.headerWidth);

    this.timeline.headerContainer.add(
      new ProxyContainer(this.#headerContainer).with({
        child: this.header = this.createHeader(),
      }),
    );

    this.#updateLayout();
  }

  #updateLayout() {
    this.#headerContainer.width = this.headerWidth.value;
    this.#content.padding = { left: this.headerWidth.value };
  }

  protected createHeader() {
    return new TimelineLayerHeader(this.title, this.layerColor);
  }
}

export class TimelineLayerHeader extends CompositeDrawable {
  constructor(readonly title: string, readonly layerColor: ColorSource) {
    super();

    this.relativeSizeAxes = Axes.Both;
  }
}

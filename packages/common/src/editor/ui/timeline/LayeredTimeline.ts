import type { DependencyContainer, Drawable, DrawableOptions, ReadonlyDependencyContainer } from 'osucad-framework';
import type { TimelineLayer } from './TimelineLayer';
import {
  Axes,
  BindableNumber,
  Box,
  CompositeDrawable,
  Container,
  dependencyLoader,
  FillDirection,
  FillFlowContainer,
  provide,
} from 'osucad-framework';
import { Timeline } from './Timeline';

export interface LayeredTimelineOptions extends DrawableOptions {
  layers?: TimelineLayer[];
  headerWidth?: number;
  timelineChildren?: Drawable[];
}

@provide(LayeredTimeline)
export class LayeredTimeline extends CompositeDrawable {
  readonly headerWidth = new BindableNumber(100).withMinValue(0);

  constructor(options: LayeredTimelineOptions = {}) {
    const { layers, timelineChildren, ...rest } = options;
    super();

    this.#layersFlow = new FillFlowContainer({
      direction: FillDirection.Vertical,
      relativeSizeAxes: Axes.X,
      autoSizeAxes: Axes.Y,
    });

    this.timeline = new Timeline({
      relativeSizeAxes: Axes.Both,
      children: [
        ...timelineChildren ?? [],
      ],
    });

    this.with(rest);

    if (layers) {
      for (const layer of layers)
        this.#layersFlow.add(layer);
    }
  }

  readonly #layersFlow: FillFlowContainer<TimelineLayer>;

  readonly timeline: Timeline;

  #headerContainer!: Container;

  #timelineContainer!: Container;

  get headerContainer() {
    return this.#headerContainer;
  }

  protected override createChildDependencies(parentDependencies: ReadonlyDependencyContainer): DependencyContainer {
    const dependencies = super.createChildDependencies(parentDependencies);

    dependencies.provide(Timeline, this.timeline);

    return dependencies;
  }

  @dependencyLoader()
  [Symbol('load')]() {
    this.relativeSizeAxes = Axes.Both;

    this.addAllInternal(
      this.#timelineContainer = new Container({
        relativeSizeAxes: Axes.Both,
        child: this.timeline,
      }),
      this.#layersFlow,
      this.#headerContainer = new Container({
        relativeSizeAxes: Axes.Y,
        children: [
          this.createHeaderBackground(),
        ],
      }),
    );

    this.headerWidth.addOnChangeListener((width) => {
      this.#headerContainer.width = width.value;
      this.#timelineContainer.padding = { left: width.value };
    }, { immediate: true });
  }

  protected createHeaderBackground(): Drawable {
    return new Box({
      relativeSizeAxes: Axes.Both,
      color: 0x17171B,
    });
  }
}

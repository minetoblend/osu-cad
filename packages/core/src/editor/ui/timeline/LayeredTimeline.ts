import type { Drawable, DrawableOptions, ReadonlyDependencyContainer } from '@osucad/framework';
import type { ColorSource } from 'pixi.js';
import type { PointVisualization } from './PointVisualization';
import type { TimelineLayer } from './TimelineLayer';
import { Anchor, Axes, BindableNumber, Box, Container, DependencyContainer, FillDirection, FillFlowContainer, provide, Vec2 } from '@osucad/framework';
import { BottomAlignedTickDisplay } from './BottomAlignedTickDisplay';
import { Timeline } from './Timeline';
import { TimelineTickDisplay } from './TimelineTickDisplay';

export interface LayeredTimelineOptions extends DrawableOptions {
  layers?: TimelineLayer[];
  headerWidth?: number;
  timelineChildren?: Drawable[];
}

@provide(LayeredTimeline)
export class LayeredTimeline extends Container {
  readonly headerWidth = new BindableNumber(100).withMinValue(0);

  constructor(options: LayeredTimelineOptions = {}) {
    const { layers, timelineChildren, ...rest } = options;
    super();

    this.#layersFlow = new FillFlowContainer({
      direction: FillDirection.Vertical,
      relativeSizeAxes: Axes.X,
      autoSizeAxes: Axes.Y,
      spacing: new Vec2(2),
    });

    this.#timeline = new Timeline().with({
      relativeSizeAxes: Axes.Both,
      children: [
        new Container({
          relativeSizeAxes: Axes.X,
          height: 20,
          children: [
            new Box({
              relativeSizeAxes: Axes.Both,
              color: 0x222228,
            }),
            new BottomAlignedTickDisplay().with({
              height: 0.5,
              anchor: Anchor.BottomLeft,
              origin: Anchor.BottomLeft,
            }),
          ],
        }),
        new Container({
          relativeSizeAxes: Axes.Both,
          padding: { top: 20 },
          children: [
            new FullHeightTickDisplay(),
            this.#layersFlow,
          ],
        }),
        ...(timelineChildren ?? []),
      ],
    });

    this.with(rest);

    if (layers) {
      for (const layer of layers)
        this.#layersFlow.add(layer);
    }
  }

  readonly #timeline: Timeline;

  get timeline() {
    return this.#timeline;
  }

  #timelineContainer!: Container;

  override get content(): Container<Drawable> {
    return this.#timeline.content;
  }

  readonly #layersFlow: FillFlowContainer<TimelineLayer>;

  #headerContainer!: Container;

  get headerContainer() {
    return this.#headerContainer;
  }

  protected override createChildDependencies(parentDependencies: ReadonlyDependencyContainer): DependencyContainer {
    const dependencies = new DependencyContainer(parentDependencies);

    dependencies.provide(Timeline, this.timeline);

    return dependencies;
  }

  readonly overlayContainer = new Container({ relativeSizeAxes: Axes.Both });

  protected override load(dependencies: ReadonlyDependencyContainer) {
    super.load(dependencies);

    this.relativeSizeAxes = Axes.Both;

    this.addAllInternal(
      this.#timelineContainer = new Container({
        relativeSizeAxes: Axes.Both,
        children: [
          this.#timeline,
          this.overlayContainer,
        ],
      }),
      this.#headerContainer = new Container({
        relativeSizeAxes: Axes.Y,
        alpha: 0.25,
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

class FullHeightTickDisplay extends TimelineTickDisplay {
  protected override createPointVisualization(): PointVisualization {
    return super.createPointVisualization().with({
      anchor: Anchor.TopLeft,
      origin: Anchor.TopCenter,
    });
  }

  protected override getSize(divisor: number, indexInBar: number): Vec2 {
    return super.getSize(divisor, indexInBar).withY(1).mul({
      x: 0.5,
      y: 1,
    });
  }

  protected override getColor(divisor: number): ColorSource {
    return 0xFFFFFF;
  }

  protected override getAlpha(divisor: number): number {
    return divisor === 1 ? 0.15 : 0.075;
  }
}

import type { Drawable } from 'osucad-framework';
import { Axes, BindableBoolean, Box, CompositeDrawable, Container, dependencyLoader, EasingFunction } from 'osucad-framework';
import { HitSoundsTimelineLayerHeader } from './HitSoundsTimelineLayerHeader.ts';

export abstract class HitSoundsTimelineLayer extends CompositeDrawable {
  protected constructor(readonly title: string) {
    super();
  }

  get preferredHeight() {
    return 100;
  }

  expanded = new BindableBoolean(true);

  @dependencyLoader()
  load() {
    this.relativeSizeAxes = Axes.X;
    this.height = this.preferredHeight;

    this.internalChildren = [
      new Container({
        relativeSizeAxes: Axes.Both,
        padding: { left: 180 },
        children: [
          this.#oddLayerBackground = new Box({
            relativeSizeAxes: Axes.Both,
            color: 0x000000,
            alpha: 0.1,
          }),
          this.createContent(),
        ],
      }),
      new Container({
        relativeSizeAxes: Axes.Y,
        width: 180,
        children: [
          new Box({
            relativeSizeAxes: Axes.Both,
            color: 0x151517,
          }),
          new HitSoundsTimelineLayerHeader(this.title, this.expanded),
        ],
      }),
    ];

    this.expanded.addOnChangeListener((e) => {
      this.resizeHeightTo(e.value ? this.preferredHeight : 35, 300, EasingFunction.OutExpo);
    });
  }

  protected abstract createContent(): Drawable;

  #oddLayerBackground!: Box;

  #layerIndex = 0;

  get layerIndex() {
    return this.#layerIndex;
  }

  set layerIndex(value) {
    if (value === this.#layerIndex)
      return;

    this.#layerIndex = value;
    this.scheduler.addOnce(this.#updateBackground, this);
  }

  #updateBackground() {
    this.#oddLayerBackground.alpha = this.#layerIndex % 2 === 0 ? 0.1 : 0;
  }
}

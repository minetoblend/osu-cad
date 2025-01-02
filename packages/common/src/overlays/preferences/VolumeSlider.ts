import type {
  Bindable,
  DragEndEvent,
  DragEvent,
  DragStartEvent,
  HoverEvent,
  HoverLostEvent,
  MouseDownEvent,
  MouseUpEvent,
  ReadonlyDependencyContainer,
} from 'osucad-framework';
import {
  Anchor
  , Axes,
  clamp,
  CompositeDrawable,
  Container,
  EasingFunction,
  MouseButton,
  RoundedBox,
} from 'osucad-framework';

import { OsucadSpriteText } from '../../drawables/OsucadSpriteText';

export class VolumeSliderContainer extends Container {
  constructor(
    readonly title: string,
    readonly bindable: Bindable<number>,
    readonly min = 0,
    readonly max = 1,
    readonly format?: (value: number) => string,
  ) {
    super({
      relativeSizeAxes: Axes.X,
      height: 35,
    });
  }

  protected override load(dependencies: ReadonlyDependencyContainer) {
    super.load(dependencies);

    this.addAllInternal(
      new OsucadSpriteText({
        text: this.title,
        color: 0xB6B6C3,
        fontSize: 14,
      }),
      new Container({
        relativeSizeAxes: Axes.X,
        height: 20,
        y: 15,
        padding: { right: 60 },
        child: new VolumeSlider(this.bindable, this.min, this.max),
      }),
      new Container({
        anchor: Anchor.TopRight,
        origin: Anchor.TopRight,
        y: 15,
        height: 20,
        width: 50,
        child: (this.#valueText = new OsucadSpriteText({
          text: '100%',
          color: 0xB6B6C3,
          fontSize: 14,
        })),
      }),
    );

    this.bindable.addOnChangeListener(
      ({ value }) => {
        this.#valueText.text
          = this.format?.(value)
          ?? `${Math.round(value * 100)}%`;
      },
      { immediate: true },
    );
  }

  #valueText!: OsucadSpriteText;
}

export class VolumeSlider extends CompositeDrawable {
  constructor(
    readonly bindable: Bindable<number>,
    readonly min = 0,
    readonly max = 1,
  ) {
    super();

    this.relativeSizeAxes = Axes.Both;

    this.addAllInternal(this.#track, this.#activeTrack, this.#thumb);
  }

  protected override load(dependencies: ReadonlyDependencyContainer) {
    super.load(dependencies);

    this.bindable.addOnChangeListener(
      ({ value }) => {
        value = (value - this.min) / (this.max - this.min);

        this.#thumb.moveToX(value, 200, EasingFunction.OutQuad);
        this.#activeTrack.resizeWidthTo(value, 200, EasingFunction.OutQuad);
      },
      { immediate: true },
    );
  }

  #track = new RoundedBox({
    relativeSizeAxes: Axes.X,
    height: 2,
    alpha: 0.5,
    cornerRadius: 1,
    anchor: Anchor.CenterLeft,
    origin: Anchor.CenterLeft,
  });

  #activeTrack = new RoundedBox({
    relativeSizeAxes: Axes.X,
    width: 0,
    height: 2,
    cornerRadius: 1,
    anchor: Anchor.CenterLeft,
    origin: Anchor.CenterLeft,
  });

  #thumb = new RoundedBox({
    relativePositionAxes: Axes.X,
    width: 12,
    height: 8,
    cornerRadius: 10,
    color: 0xFFFFFF,
    anchor: Anchor.CenterLeft,
    origin: Anchor.Center,
  });

  override onHover(e: HoverEvent): boolean {
    this.#thumb.scale = 1.25;
    return true;
  }

  override onHoverLost(e: HoverLostEvent) {
    this.#thumb.scale = 1;
    return true;
  }

  override onMouseDown(e: MouseDownEvent): boolean {
    if (e.button === MouseButton.Left) {
      const x = e.mousePosition.x / this.drawSize.x;
      this.bindable.value = clamp(x, 0, 1) * (this.max - this.min) + this.min;
      return true;
    }

    return false;
  }

  override onDragStart(e: DragStartEvent): boolean {
    return e.button === MouseButton.Left;
  }

  override onDrag(e: DragEvent): boolean {
    const x = e.mousePosition.x / this.drawSize.x;
    this.bindable.value = clamp(x, 0, 1) * (this.max - this.min) + this.min;
    return true;
  }

  override onDragEnd(e: DragEndEvent): boolean {
    return true;
  }

  override onMouseUp(e: MouseUpEvent): boolean {
    return true;
  }
}

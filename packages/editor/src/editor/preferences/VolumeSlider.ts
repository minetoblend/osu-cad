import gsap from 'gsap';
import type {
  Bindable,

  DragEndEvent,
  DragEvent,
  DragStartEvent,
  MouseDownEvent,
  MouseUpEvent,
} from 'osucad-framework';
import {
  Anchor,
  Axes,
  CompositeDrawable,
  Container,
  MouseButton,
  RoundedBox,
  clamp,
  dependencyLoader,
} from 'osucad-framework';
import { OsucadSpriteText } from '../../OsucadSpriteText';

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

  @dependencyLoader()
  load() {
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
      (value) => {
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

  @dependencyLoader()
  load() {
    this.bindable.addOnChangeListener(
      (value) => {
        value = (value - this.min) / (this.max - this.min);

        gsap.to(this.#thumb, {
          x: value,
          duration: 0.2,
          ease: 'power2.out',
        });
        gsap.to(this.#activeTrack, {
          width: value,
          duration: 0.2,
          ease: 'power2.out',
        });
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

  onHover(): boolean {
    this.#thumb.scale = 1.25;
    return true;
  }

  onHoverLost(): boolean {
    this.#thumb.scale = 1;
    return true;
  }

  onMouseDown(e: MouseDownEvent): boolean {
    if (e.button === MouseButton.Left) {
      const x = e.mousePosition.x / this.drawSize.x;
      this.bindable.value = clamp(x, 0, 1) * (this.max - this.min) + this.min;
      return true;
    }

    return false;
  }

  onDragStart(e: DragStartEvent): boolean {
    return e.button === MouseButton.Left;
  }

  onDrag(e: DragEvent): boolean {
    const x = e.mousePosition.x / this.drawSize.x;
    this.bindable.value = clamp(x, 0, 1) * (this.max - this.min) + this.min;
    return true;
  }

  onDragEnd(e: DragEndEvent): boolean {
    return true;
  }

  onMouseUp(e: MouseUpEvent): boolean {
    return true;
  }
}

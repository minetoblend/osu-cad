import gsap from 'gsap';
import {
  Anchor,
  Axes,
  clamp,
  CompositeDrawable,
  Container,
  dependencyLoader,
  DragEvent,
  DragStartEvent,
  DrawableOptions,
  MouseButton,
  resolved,
  RoundedBox,
  SpriteText,
  Vec2,
} from 'osucad-framework';
import { UISamples } from '../UISamples';
import { EditorClock } from './EditorClock';
import { ThemeColors } from './ThemeColors';
import { OsucadSpriteText } from '../OsucadSpriteText';

export class BeatSnapDivisorSelector extends CompositeDrawable {
  constructor() {
    super();

    this.relativeSizeAxes = Axes.Both;
  }

  @resolved(ThemeColors)
  colors!: ThemeColors;

  @resolved(EditorClock)
  editorClock!: EditorClock;

  #beatSnapText!: SpriteText;

  @dependencyLoader()
  load() {
    this.addAllInternal(
      new OsucadSpriteText({
        text: 'Beat snap divisor',
        color: this.colors.text,
        fontSize: 14,
      }),
      (this.#beatSnapText = new OsucadSpriteText({
        text: '1/1',
        anchor: Anchor.TopRight,
        origin: Anchor.TopRight,
        color: this.colors.text,
        fontSize: 14,
      })),
      new Container({
        relativeSizeAxes: Axes.Both,
        padding: { top: 20 },
        child: new BeatSnapSlider({
          relativeSizeAxes: Axes.Both,
        }),
      }),
    );

    this.editorClock.beatSnapDivisor.addOnChangeListener(
      (divisor) => {
        this.#beatSnapText.text = `1/${divisor}`;
      },
      { immediate: true },
    );
  }
}

class BeatSnapSlider extends CompositeDrawable {
  constructor(options: DrawableOptions = {}) {
    super();

    this.apply(options);
  }

  @resolved(ThemeColors)
  colors!: ThemeColors;

  #track!: RoundedBox;

  #activeTrack!: RoundedBox;

  #thumb!: RoundedBox;

  @dependencyLoader()
  load() {
    this.addAllInternal(
      (this.#track = new RoundedBox({
        relativeSizeAxes: Axes.X,
        height: 2,
        color: this.colors.text,
        alpha: 0.5,
        cornerRadius: 2,
        anchor: Anchor.CenterLeft,
        origin: Anchor.CenterLeft,
      })),
      (this.#activeTrack = new RoundedBox({
        relativeSizeAxes: Axes.X,
        height: 2,
        color: 'white',
        width: 0,
        cornerRadius: 2,
        anchor: Anchor.CenterLeft,
        origin: Anchor.CenterLeft,
      })),
      (this.#thumb = new RoundedBox({
        size: new Vec2(12, 8),
        color: 'white',
        cornerRadius: 5,
        anchor: Anchor.CenterLeft,
        origin: Anchor.Center,
        relativePositionAxes: Axes.X,
      })),
    );

    this.editorClock.beatSnapDivisor.addOnChangeListener(
      () => this.#updateThumbAndTrack(),
      { immediate: true },
    );
  }

  onHover(): boolean {
    gsap.to(this.#thumb, {
      scaleX: 1.2,
      scaleY: 1.2,
      duration: 0.2,
      ease: 'power4.out',
    });
    return true;
  }

  onHoverLost(): boolean {
    gsap.to(this.#thumb, {
      scaleX: 1,
      scaleY: 1,
      duration: 0.2,
      ease: 'power4.out',
    });
    return true;
  }

  onDragStart(e: DragStartEvent): boolean {
    return e.button === MouseButton.Left;
  }

  @resolved(EditorClock)
  editorClock!: EditorClock;

  @resolved(UISamples)
  samples!: UISamples;

  #lastDrag = 0;
  #lastDragX = 0;

  #dragSampleDelay = 50;

  onDrag(e: DragEvent): boolean {
    const relative = e.mousePosition.x / this.drawSize.x;

    this.editorClock.beatSnapDivisor.value = clamp(
      Math.floor(relative * 16) + 1,
      1,
      16,
    );

    if (
      this.time.current - this.#lastDrag > this.#dragSampleDelay &&
      Math.abs(this.#lastDragX - e.mousePosition.x) > 3
    ) {
      const pitch = 0.75 + relative * 0.35;

      this.samples.sliderDrag.play({
        rate: pitch,
      });
      this.#lastDrag = this.time.current;
      this.#lastDragX = e.mousePosition.x;
    }

    return true;
  }

  #updateThumbAndTrack() {
    const relative = (this.editorClock.beatSnapDivisor.value - 1) / 15;

    gsap.to(this.#thumb, {
      x: relative,
      duration: 0.2,
      ease: 'power4.out',
    });

    gsap.to(this.#activeTrack, {
      width: relative,
      duration: 0.2,
      ease: 'power4.out',
    });
  }
}

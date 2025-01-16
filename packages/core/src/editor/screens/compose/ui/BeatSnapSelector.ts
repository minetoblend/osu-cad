import type { DragEvent, DragStartEvent, DrawableOptions, HoverEvent, HoverLostEvent, ReadonlyDependencyContainer, SpriteText } from '@osucad/framework';
import type { BindableBeatDivisor } from '../../../BindableBeatDivisor';
import { Anchor, Axes, clamp, CompositeDrawable, Container, EasingFunction, FillDirection, FillFlowContainer, MouseButton, resolved, RoundedBox, Vec2 } from '@osucad/framework';
import { OsucadSpriteText } from '../../../../drawables/OsucadSpriteText';
import { OsucadColors } from '../../../../OsucadColors';
import { UISamples } from '../../../../UISamples';
import { EditorClock } from '../../../EditorClock';

export class BeatSnapSelector extends CompositeDrawable {
  constructor() {
    super();

    this.relativeSizeAxes = Axes.Both;

    this.internalChildren = [
      new FillFlowContainer({
        autoSizeAxes: Axes.Both,
        direction: FillDirection.Horizontal,
        spacing: new Vec2(20),
        anchor: Anchor.TopRight,
        origin: Anchor.TopRight,
        children: [
          this.#beatSnapText = new OsucadSpriteText({
            text: '1/1',
            anchor: Anchor.CenterLeft,
            origin: Anchor.CenterLeft,
            color: OsucadColors.text,
            fontSize: 14,
          }),
          new OsucadSpriteText({
            text: 'Beat Snap',
            color: OsucadColors.text,
            fontWeight: 600,
            fontSize: 12,
            anchor: Anchor.CenterLeft,
            origin: Anchor.CenterLeft,
          }),
        ],
      }),
      new Container({
        relativeSizeAxes: Axes.Both,
        padding: { top: 15 },
        child: new BeatSnapSlider({
          relativeSizeAxes: Axes.Both,
        }),
      }),
    ];
  }

  @resolved(() => EditorClock)
  editorClock!: EditorClock;

  #beatSnapText!: SpriteText;

  protected override load(dependencies: ReadonlyDependencyContainer) {
    super.load(dependencies);

    this.editorClock.beatSnapDivisor.addOnChangeListener(
      (e) => {
        this.#beatSnapText.text = `1/${e.value}`;
      },
      { immediate: true },
    );
  }
}

class BeatSnapSlider extends CompositeDrawable {
  constructor(options: DrawableOptions = {}) {
    super();

    this.with(options);

    this.internalChildren = [
      new RoundedBox({
        relativeSizeAxes: Axes.X,
        height: 2,
        color: OsucadColors.text,
        alpha: 0.5,
        cornerRadius: 2,
        anchor: Anchor.CenterLeft,
        origin: Anchor.CenterLeft,
      }),
      this.#activeTrack = new RoundedBox({
        relativeSizeAxes: Axes.X,
        height: 2,
        color: 'white',
        width: 0,
        cornerRadius: 2,
        anchor: Anchor.CenterLeft,
        origin: Anchor.CenterLeft,
      }),
      this.#thumb = new RoundedBox({
        size: new Vec2(12, 8),
        color: 'white',
        cornerRadius: 5,
        anchor: Anchor.CenterLeft,
        origin: Anchor.Center,
        relativePositionAxes: Axes.X,
      }),
    ];
  }

  #activeTrack!: RoundedBox;

  #thumb!: RoundedBox;

  beatSnapDivisor!: BindableBeatDivisor;

  protected override load(dependencies: ReadonlyDependencyContainer) {
    super.load(dependencies);

    this.beatSnapDivisor = this.editorClock.beatSnapDivisor.getBoundCopy();
  }

  protected override loadComplete() {
    super.loadComplete();

    this.beatSnapDivisor.bindValueChanged(() => this.#updateThumbAndTrack(), true);
  }

  override onHover(e: HoverEvent): boolean {
    this.#thumb.scaleTo(1.2, 200, EasingFunction.OutExpo);

    return true;
  }

  override onHoverLost(e: HoverLostEvent) {
    this.#thumb.scaleTo(1, 200, EasingFunction.OutExpo);
  }

  override onDragStart(e: DragStartEvent): boolean {
    return e.button === MouseButton.Left;
  }

  @resolved(() => EditorClock)
  editorClock!: EditorClock;

  @resolved(() => UISamples)
  samples!: UISamples;

  #lastDrag = 0;
  #lastDragX = 0;

  #dragSampleDelay = 50;

  override onDrag(e: DragEvent): boolean {
    const relative = e.mousePosition.x / this.drawSize.x;

    this.editorClock.beatSnapDivisor.value = clamp(Math.floor(relative * 16) + 1, 1, 16);

    if (
      this.time.current - this.#lastDrag > this.#dragSampleDelay
      && Math.abs(this.#lastDragX - e.mousePosition.x) > 3
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
    const x = (this.editorClock.beatSnapDivisor.value - 1) / 15;

    this.#thumb.moveToX(x, 200, EasingFunction.OutExpo);
    this.#activeTrack.resizeWidthTo(x, 200, EasingFunction.OutExpo);
  }
}

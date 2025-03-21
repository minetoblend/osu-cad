import type { ReadonlyDependencyContainer } from '@osucad/framework';
import type { IHasTooltip } from '../../drawables/TooltipContainer';
import { Anchor, Axes, BindableNumber, CompositeDrawable, Container, resolved } from '@osucad/framework';
import { OsucadSpriteText } from '../../drawables/OsucadSpriteText';
import { SliderBar } from '../../overlays/preferencesV2/SliderBar';
import { EditorClock } from '../EditorClock';

export class PlaybackRateControl extends CompositeDrawable implements IHasTooltip {
  constructor() {
    super();

    this.relativeSizeAxes = Axes.Both;
  }

  readonly playbackRate = new BindableNumber(1)
    .withMinValue(0.25)
    .withMaxValue(1.5)
    .withPrecision(0.25);

  #spriteText!: OsucadSpriteText;

  @resolved(EditorClock)
  editorClock!: EditorClock;

  protected override load(dependencies: ReadonlyDependencyContainer) {
    super.load(dependencies);

    this.internalChildren = [
      new Container({
        relativeSizeAxes: Axes.Both,
        padding: { right: 40 },
        child: new SliderBar(this.playbackRate)
          .with({
            anchor: Anchor.CenterLeft,
            origin: Anchor.CenterLeft,
          }),
      }),
      this.#spriteText = new OsucadSpriteText({
        text: '1x',
        fontSize: 13,
        fontWeight: 600,
        anchor: Anchor.CenterRight,
        origin: Anchor.CenterRight,
      }),
    ];
  }

  protected override loadComplete() {
    super.loadComplete();

    this.playbackRate.bindValueChanged((evt) => {
      this.#spriteText.text = `${evt.value.toFixed(2)}x`;
      this.editorClock.rate = evt.value;
    }, true);
  }

  override update() {
    super.update();

    if (this.editorClock.rate !== this.playbackRate.value)
      this.playbackRate.value = this.editorClock.rate;
  }

  override get requestsPositionalInput(): boolean {
    return true;
  }

  readonly tooltipText = 'Playback rate';
}

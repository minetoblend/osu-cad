import {
  Anchor,
  Axes,
  BindableNumber,
  Box,
  Container,
  dependencyLoader,
  PoolableDrawable,
  resolved,
} from 'osucad-framework';
import { ControlPointGroup } from '../../../beatmap/timing/ControlPointGroup.ts';
import { OsucadSpriteText } from '../../../OsucadSpriteText.ts';
import { TimestampFormatter } from '../../TimestampFormatter.ts';
import { TimingPointValueBadge } from './TimingPointValueBadge.ts';
import { SampleSet } from '../../../beatmap/hitSounds/SampleSet.ts';
import { EditorClock } from '../../EditorClock.ts';
import { FastRoundedBox } from '../../../drawables/FastRoundedBox.ts';

export class TimingPointRow extends PoolableDrawable {
  constructor() {
    super();
  }

  static HEIGHT = 25;

  static COLUMNS = {
    startTime: {
      x: 10,
      width: 85,
    },
    timing: {
      x: 85,
      width: 140,
    },
    hitSounds: {
      x: 225,
      width: 100,
    },
    sliderVelocity: {
      x: 325,
      width: 70,
    },
    effects: {
      x: 395,
      width: 100,
    },
  };

  static MIN_WIDTH = this.COLUMNS.effects.x + this.COLUMNS.effects.width;

  #controlPoint: ControlPointGroup | null = null;

  get controlPoint() {
    return this.#controlPoint;
  }

  index: number = 0;

  set controlPoint(value: ControlPointGroup | null) {
    if (this.#controlPoint === value)
      return;

    if (this.#controlPoint) {
      this.onFree(this.#controlPoint);
    }

    this.#controlPoint = value;

    if (this.#controlPoint) {
      this.onAssign(this.#controlPoint);
    }
  }

  #hoverHighlight!: Box;

  onHover(): boolean {
    this.#updateHighlight();
    return true;
  }

  onHoverLost(): boolean {
    this.#updateHighlight();
    return true;
  }

  startTime = new BindableNumber();

  protected onAssign(controlPoint: ControlPointGroup) {
    this.startTime.bindTo(controlPoint.timeBindable);

    controlPoint.changed.addListener(this.#updateState, this);

    this.#updateState();
  }

  protected onFree(controlPoint: ControlPointGroup) {
    this.startTime.unbindFrom(controlPoint.timeBindable);

    controlPoint.changed.removeListener(this.#updateState);
  }

  #updateState() {
    const controlPoint = this.controlPoint!;

    if (controlPoint.timing) {
      this.#timing.alpha = 1;
      this.#timing.text = `${controlPoint.timing.bpm.toFixed(2)}bpm ${controlPoint.timing.meter}/4`;
    } else {
      this.#timing.alpha = 0;
    }

    if (controlPoint.difficulty) {
      this.#sliderVelocity.alpha = 1;
      this.#sliderVelocity.text = `${controlPoint.difficulty.sliderVelocity.toFixed(2)}`;
    } else {
      this.#sliderVelocity.alpha = 0;
    }

    if (controlPoint.sample) {
      this.#hitSounds.alpha = 1;

      let sampleSet = '';

      switch (controlPoint.sample.sampleSet) {
        case SampleSet.Auto:
          sampleSet = 'auto';
          break;
        case SampleSet.Normal:
          sampleSet = 'normal';
          break;
        case SampleSet.Soft:
          sampleSet = 'soft';
          break;
        case SampleSet.Drum:
          sampleSet = 'drum';
          break;
      }

      if (controlPoint.sample.sampleIndex !== 0)
        sampleSet += ':' + controlPoint.sample.sampleIndex;

      this.#hitSounds.text = `${Math.round(controlPoint.sample.volume * 100).toString().padStart(3, ' ')}% ${sampleSet}`;
    } else {
      this.#hitSounds.alpha = 0;
    }

    if (controlPoint.effect) {
      if (controlPoint.effect.kiaiMode) {
        this.#effects.alpha = 1;
        this.#effects.textColor = 0xE035F0;
      } else {
        this.#effects.alpha = 0.5;
        this.#effects.textColor = 0xFFFFFF;
      }
    } else {
      this.#effects.alpha = 0;
    }
  }

  @dependencyLoader()
  load() {
    this.relativeSizeAxes = Axes.X;
    this.height = TimingPointRow.HEIGHT;

    this.addAllInternal(
      new Container({
        relativeSizeAxes: Axes.Both,
        padding: 8,
        children: [
          this.#timestamp = new OsucadSpriteText({
            text: '00:00.000',
            x: TimingPointRow.COLUMNS.startTime.x,
            fontSize: 14,
            anchor: Anchor.CenterLeft,
            origin: Anchor.CenterLeft,
          }),
          new Container({
            x: TimingPointRow.COLUMNS.timing.x,
            width: TimingPointRow.COLUMNS.timing.width,
            relativeSizeAxes: Axes.Y,
            child: this.#timing = new TimingPointValueBadge('0.000', 0x52CCA3),
          }),
          new Container({
            x: TimingPointRow.COLUMNS.hitSounds.x,
            width: TimingPointRow.COLUMNS.hitSounds.width,
            relativeSizeAxes: Axes.Y,
            child: this.#hitSounds = new TimingPointValueBadge('', 0x207bfa),
          }),
          new Container({
            x: TimingPointRow.COLUMNS.sliderVelocity.x,
            width: TimingPointRow.COLUMNS.sliderVelocity.width,
            relativeSizeAxes: Axes.Y,
            child: this.#sliderVelocity = new TimingPointValueBadge('', 0xfcba03),
          }),
          new Container({
            relativeSizeAxes: Axes.Both,
            padding: { horizontal: 2 },
            child: this.#activeIndicator = new FastRoundedBox({
              width: 3,
              relativeSizeAxes: Axes.Y,
              cornerRadius: 2,
              color: 0x343440,
            }),
          }),
          new Container({
            x: TimingPointRow.COLUMNS.effects.x,
            width: TimingPointRow.COLUMNS.effects.width,
            relativeSizeAxes: Axes.Y,
            child: this.#effects = new TimingPointValueBadge('kiai', 0xe035f0),
          }),
        ],
      }),
      this.#hoverHighlight = new Box({
        alpha: 0,
        relativeSizeAxes: Axes.Both,
      }),
    );

    this.startTime.addOnChangeListener(time => this.#timestamp.text = TimestampFormatter.formatTimestamp(time.value));
  }

  #timestamp!: OsucadSpriteText;

  #timing!: TimingPointValueBadge;

  #sliderVelocity!: TimingPointValueBadge;

  #hitSounds!: TimingPointValueBadge;

  #effects!: TimingPointValueBadge;

  @resolved(EditorClock)
  editorClock!: EditorClock;

  onDoubleClick(): boolean {
    this.editorClock.seek(this.controlPoint!.time, false);

    return true;
  }

  #active = false;

  get active() {
    return this.#active;
  }

  set active(value) {
    if (this.#active === value)
      return;

    this.#active = value;

    this.#activeIndicator.color = value ? 0x52CCA3 : 0x343440;

    this.#updateHighlight();
  }

  #activeIndicator!: FastRoundedBox;

  #updateHighlight() {
    if (this.isHovered)
      this.#hoverHighlight.alpha = 0.1;
    else
      this.#hoverHighlight.alpha = this.#active ? 0.05 : 0;
  }

}

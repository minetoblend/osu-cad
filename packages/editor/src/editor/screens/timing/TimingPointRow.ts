import type { ClickEvent, DependencyContainer, MouseDownEvent } from 'osucad-framework';
import type { ControlPointGroup } from '../../../beatmap/timing/ControlPointGroup';
import { Anchor, Axes, Bindable, BindableNumber, Box, Container, dependencyLoader, MouseButton, PoolableDrawable, resolved } from 'osucad-framework';
import { SampleSet } from '../../../beatmap/hitSounds/SampleSet';
import { ControlPointInfo } from '../../../beatmap/timing/ControlPointInfo';
import { FastRoundedBox } from '../../../drawables/FastRoundedBox';
import { OsucadSpriteText } from '../../../OsucadSpriteText';
import { EditorClock } from '../../EditorClock';
import { ThemeColors } from '../../ThemeColors';
import { TimestampFormatter } from '../../TimestampFormatter';
import { TimingPointValueBadge } from './TimingPointValueBadge';
import { TimingScreenDependencies } from './TimingScreenDependencies';

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

  activeControlPoint = new Bindable<ControlPointGroup | null>(null);

  protected onAssign(controlPoint: ControlPointGroup) {
    this.startTime.bindTo(controlPoint.timeBindable);

    controlPoint.added.addListener(this.#scheduleUpdateState, this);
    controlPoint.removed.addListener(this.#scheduleUpdateState, this);
    controlPoint.changed.addListener(this.#scheduleUpdateState, this);

    this.#scheduleUpdateState();
  }

  protected onFree(controlPoint: ControlPointGroup) {
    this.startTime.unbindFrom(controlPoint.timeBindable);

    controlPoint.added.removeListener(this.#scheduleUpdateState, this);
    controlPoint.removed.removeListener(this.#scheduleUpdateState, this);
    controlPoint.changed.removeListener(this.#scheduleUpdateState, this);
  }

  #scheduleUpdateState() {
    this.scheduler.addOnce(this.#updateState, this);
  }

  #updateState() {
    const controlPoint = this.controlPoint!;

    if (controlPoint.timing) {
      this.#timing.alpha = 1;
      this.#timing.text = `${controlPoint.timing.bpm.toFixed(2)}bpm ${controlPoint.timing.meter}/4`;
    }
    else {
      this.#timing.alpha = 0;
    }

    if (controlPoint.difficulty) {
      this.#sliderVelocity.alpha = 1;
      this.#sliderVelocity.text = `${controlPoint.difficulty.sliderVelocity.toFixed(2)}`;
    }
    else {
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
        sampleSet += `:${controlPoint.sample.sampleIndex}`;

      this.#hitSounds.text = `${Math.round(controlPoint.sample.volume).toString().padStart(3, ' ')}% ${sampleSet}`;
    }
    else {
      this.#hitSounds.alpha = 0;
    }
  }

  @resolved(ThemeColors)
  colors!: ThemeColors;

  @dependencyLoader()
  load(dependencies: DependencyContainer) {
    const { activeControlPoint } = dependencies.resolve(TimingScreenDependencies);

    this.activeControlPoint.bindTo(activeControlPoint);

    this.relativeSizeAxes = Axes.X;
    this.height = TimingPointRow.HEIGHT;

    this.addAllInternal(
      this.#background = new Box({
        relativeSizeAxes: Axes.Both,
        color: this.colors.primary,
        alpha: 0,
      }),
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
            child: this.#hitSounds = new TimingPointValueBadge('', 0x207BFA),
          }),
          new Container({
            x: TimingPointRow.COLUMNS.sliderVelocity.x,
            width: TimingPointRow.COLUMNS.sliderVelocity.width,
            relativeSizeAxes: Axes.Y,
            child: this.#sliderVelocity = new TimingPointValueBadge('', 0xFCBA03),
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
        ],
      }),
      this.#hoverHighlight = new Box({
        alpha: 0,
        relativeSizeAxes: Axes.Both,
      }),
    );

    this.startTime.addOnChangeListener(time => this.#timestamp.text = TimestampFormatter.formatTimestamp(time.value));
  }

  #background!: Box;

  #timestamp!: OsucadSpriteText;

  #timing!: TimingPointValueBadge;

  #sliderVelocity!: TimingPointValueBadge;

  #hitSounds!: TimingPointValueBadge;

  @resolved(EditorClock)
  editorClock!: EditorClock;

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

  #selected = false;

  get selected() {
    return this.#selected;
  }

  set selected(value) {
    if (this.#selected === value)
      return;

    this.#background.alpha = value ? 1 : 0;

    this.#selected = value;
  }

  onClick(e: ClickEvent): boolean {
    if (!this.active) {
      this.activeControlPoint.value = this.controlPoint;
    }

    return true;
  }

  onDoubleClick(): boolean {
    this.editorClock.seek(this.controlPoint!.time);

    return true;
  }

  @resolved(ControlPointInfo)
  controlPointInfo!: ControlPointInfo;

  onMouseDown(e: MouseDownEvent): boolean {
    if (e.button === MouseButton.Right)
      this.controlPointInfo.remove(this.controlPoint!);

    return true;
  }
}

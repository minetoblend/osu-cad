import type { ControlPointGroup } from '../../../beatmap/timing/ControlPointGroup';
import type { TimingPoint } from '../../../beatmap/timing/TimingPoint';
import { Anchor, Axes, Box, CompositeDrawable, dependencyLoader, resolved } from 'osucad-framework';
import { OsucadSpriteText } from '../../../OsucadSpriteText.ts';
import { ThemeColors } from '../../ThemeColors';
import { Timeline } from '../../timeline/Timeline';
import { TimelineControlPointMarker } from './TimelineControlPointMarker.ts';

export class TimelineControlPointDrawable extends CompositeDrawable {
  constructor(readonly controlPoint: ControlPointGroup, readonly withMarker = true) {
    super();
  }

  @dependencyLoader()
  load() {
    this.relativeSizeAxes = Axes.Y;
    this.width = 20;
    this.anchor = Anchor.TopLeft;
    this.origin = Anchor.TopRight;

    this.addAllInternal(
      this.#badge = new Box({
        relativeSizeAxes: Axes.Both,
        color: 0xF03265,
        alpha: 0,
        anchor: Anchor.TopRight,
        origin: Anchor.TopRight,
      }),
      this.#badgeText = new OsucadSpriteText({
        text: '',
        anchor: Anchor.Center,
        origin: Anchor.Center,
        rotation: Math.PI / 2,
        fontWeight: 600,
        fontSize: 9,
        alpha: 0,
      }),
      this.#line = new Box({
        relativeSizeAxes: Axes.Y,
        width: 2,
        anchor: Anchor.TopRight,
        origin: Anchor.TopCenter,
      }),
    );

    this.controlPoint.changed.addListener(() => this.scheduler.addOnce(this.#updateState, this));

    this.#updateState();
  }

  #marker!: TimelineControlPointMarker;

  #badge!: Box;

  #line!: Box;

  #badgeText!: OsucadSpriteText;

  @resolved(ThemeColors)
  theme!: ThemeColors;

  #timingPoint!: TimingPoint;

  #updateState() {
    const isInherited = !this.controlPoint.timing;

    if (isInherited) {
      this.#line.color = this.theme.text;
      this.#line.alpha = 0.4;
      this.#badge.alpha = 0;
      this.#badgeText.alpha = 0;
    }
    else {
      this.#line.color = this.theme.text;
      this.#line.alpha = 0.4;
      this.#badge.alpha = 1;
      this.#badgeText.alpha = 1;

      const timing = this.controlPoint.timing!;

      let bpm = 60_000 / timing.beatLength;

      bpm = Math.round(bpm * 100) / 100;

      this.#badgeText.text = `${bpm} bpm`;

      this.x = 0;
    }
  }

  protected loadComplete() {
    super.loadComplete();

    this.timeline = this.findClosestParentOfType(Timeline)!;

    if (this.withMarker) {
      this.timeline.overlayContainer.add(
        this.#marker = new TimelineControlPointMarker(this.controlPoint).with({
          size: 20,
          anchor: Anchor.BottomLeft,
          origin: Anchor.Center,
          rotation: Math.PI,
          y: -2,
        }),
      );
    }
  }

  timeline!: Timeline;

  update() {
    super.update();

    this.x = this.timeline.timeToPosition(this.controlPoint.time);

    if (this.#marker)
      this.#marker.x = this.x;
  }

  override dispose(isDisposing: boolean = true) {
    if (this.#marker)
      this.timeline.overlayContainer.remove(this.#marker, true);

    super.dispose(isDisposing);
  }
}

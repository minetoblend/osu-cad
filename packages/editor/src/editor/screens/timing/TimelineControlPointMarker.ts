import type {
  ClickEvent,
  DragEvent,
  DragStartEvent,
  HoverEvent,

  HoverLostEvent,
  MouseDownEvent,
  MouseUpEvent,
} from 'osucad-framework';
import type { ControlPointGroup } from '../../../beatmap/timing/ControlPointGroup.ts';
import {
  dependencyLoader,
  DrawableSprite,
  EasingFunction,
  MouseButton,
  resolved,
} from 'osucad-framework';
import { ControlPointInfo } from '../../../beatmap/timing/ControlPointInfo.ts';
import { OsucadIcons } from '../../../OsucadIcons.ts';
import { EditorClock } from '../../EditorClock.ts';
import { ComposeScreenTimeline } from '../../timeline/ComposeScreenTimeline.ts';
import { Timeline } from '../../timeline/Timeline.ts';

export class TimelineControlPointMarker extends DrawableSprite {
  constructor(readonly controlPoint: ControlPointGroup) {
    super({
      texture: OsucadIcons.get('timeline-marker'),
    });
  }

  #timeline!: Timeline;

  @dependencyLoader()
  load() {
    this.color = 0xC9C9D4;
  }

  protected loadComplete() {
    super.loadComplete();

    this.#timeline = this.findClosestParentOfType(Timeline)!;
  }

  onMouseDown(e: MouseDownEvent): boolean {
    if (e.button === MouseButton.Left) {
      this.scaleTo(0.85, 300, EasingFunction.OutExpo);

      return true;
    }
    else if (e.button === MouseButton.Right) {
      this.dependencies.resolve(ControlPointInfo).remove(this.controlPoint);
    }

    return false;
  }

  onMouseUp(e: MouseUpEvent) {
    if (e.button === 0)
      this.scaleTo(1, 300, EasingFunction.OutBack);
  }

  onClick(e: ClickEvent): boolean {
    if (this.#timeline instanceof ComposeScreenTimeline)
      this.#timeline.activeControlPoint.value = this.controlPoint;

    return true;
  }

  onHover(e: HoverEvent): boolean {
    this.color = 0xEBEBF5;
    return true;
  }

  onHoverLost(e: HoverLostEvent) {
    this.color = 0xC9C9D4;
  }

  #initialControlPoint?: ControlPointGroup;

  onDragStart(e: DragStartEvent): boolean {
    this.#initialControlPoint = this.controlPoint.deepClone();

    return true;
  }

  @resolved(EditorClock)
  private editorClock!: EditorClock;

  @resolved(ControlPointInfo)
  private controlPointInfo!: ControlPointInfo;

  onDrag(e: DragEvent): boolean {
    const position = this.#timeline.toLocalSpace(e.screenSpaceMousePosition);

    let time = this.#timeline.positionToTime(position.x);

    if (!e.shiftPressed)
      time = this.snap(time, this.editorClock.beatSnapDivisor.value);

    this.controlPoint.time = time;

    return true;
  }

  snap(time: number, divisor: number) {
    const timingPoint
      = this.controlPoint.timing
        ? this.controlPointInfo.timingPointAt(Math.min(time, this.controlPoint.time - 1))
        : this.controlPointInfo.timingPointAt(time);

    if (!timingPoint || timingPoint === this.controlPoint.timing)
      return time;

    const beatSnapLength = timingPoint.beatLength / divisor;
    const beats = (Math.max(time, 0) - timingPoint.time) / beatSnapLength;

    const closestBeat = beats < 0 ? -Math.round(-beats) : Math.round(beats);
    const snappedTime = Math.floor(
      timingPoint.time + closestBeat * beatSnapLength,
    );

    if (snappedTime >= 0)
      return snappedTime;

    return snappedTime + beatSnapLength;
  }
}

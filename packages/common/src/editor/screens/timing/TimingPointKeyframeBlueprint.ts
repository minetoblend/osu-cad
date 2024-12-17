import type { DragEndEvent, DragEvent, DragStartEvent, Drawable, HoverEvent, HoverLostEvent, MouseMoveEvent } from 'osucad-framework';
import type { TimingPoint } from '../../../controlPoints/TimingPoint';
import type { ControlPointLifetimeEntry } from '../../ui/timeline/ControlPointLifetimeEntry';
import { Anchor, Axes, clamp, CompositeDrawable, Container, dependencyLoader, EasingFunction, FastRoundedBox, resolved, RoundedBox, Vec2 } from 'osucad-framework';
import { ControlPointInfo } from '../../../controlPoints/ControlPointInfo';
import { OsucadSpriteText } from '../../../drawables/OsucadSpriteText';
import { EditorClock } from '../../EditorClock';
import { Timeline } from '../../ui/timeline/Timeline';
import { KeyframeBlueprint } from './KeyframeBlueprint';

export class TimingPointKeyframeBlueprint extends KeyframeBlueprint<TimingPoint> {
  constructor() {
    super();
  }

  override get keyframeColor(): number {
    return 0xFF265A;
  }

  #bpmText!: OsucadSpriteText;

  #label!: Container;

  @dependencyLoader()
  [Symbol('load')]() {
    this.addAllInternal(
      this.#dragHandle = new DragHandle(this),
      this.#label = new Container({
        autoSizeAxes: Axes.Both,
        anchor: Anchor.CenterLeft,
        x: 10,
        y: 10,
        children: [
          new RoundedBox({
            relativeSizeAxes: Axes.Both,
            color: this.keyframeColor,
            fillAlpha: 0.1,
            cornerRadius: 1,
            outlines: [{
              width: 1,
              alpha: 1,
              color: 0xFFFFFF,
            }],
          }),
          this.#bpmText = new OsucadSpriteText({
            fontSize: 11,
            margin: 4,
            color: this.keyframeColor,
          }),
        ],
      }),
    );
  }

  override update() {
    super.update();

    const duration = this.entry!.lifetimeEnd - this.entry!.lifetimeStart;
    this.#label.x = clamp(-this.x, 0, this.timeline.durationToSize(duration) - this.#label.drawWidth - 10) + 10;
  }

  @resolved(EditorClock)
  protected editorClock!: EditorClock;

  @resolved(ControlPointInfo)
  protected controlPointInfo!: ControlPointInfo;

  override onMouseMove(e: MouseMoveEvent): boolean {
    let time = this.timeline.screenSpacePositionToTime(e.screenSpaceMousePosition);

    time = this.controlPointInfo.snap(time, this.editorClock.beatSnapDivisor.value);

    if (!this.#dragHandle.isDragged) {
      this.#dragHandle.currentTime = time;

      if (time > this.entry!.lifetimeStart && time < this.entry!.lifetimeEnd)
        this.#dragHandle.show();
      else
        this.#dragHandle.hide();
    }

    return true;
  }

  protected override onApply(entry: ControlPointLifetimeEntry<TimingPoint>) {
    super.onApply(entry);

    entry.start.beatLengthBindable.valueChanged.addListener(this.onInvalidated, this);
  }

  protected override onFree(entry: ControlPointLifetimeEntry<TimingPoint>) {
    super.onFree(entry);

    entry.start.beatLengthBindable.valueChanged.removeListener(this.onInvalidated, this);
  }

  override onInvalidated() {
    super.onInvalidated();

    this.#bpmText.text = `${this.controlPoint!.bpm.toFixed(2)}bpm`;
  }

  #dragHandle!: DragHandle;

  override onHover(e: HoverEvent): boolean {
    if (!this.#dragHandle.isDragged)
      this.#dragHandle.show();
    return true;
  }

  override onHoverLost(e: HoverLostEvent) {
    if (!this.#dragHandle.isDragged)
      this.#dragHandle.hide();
  }
}

class DragHandle extends CompositeDrawable {
  constructor(readonly blueprint: TimingPointKeyframeBlueprint) {
    super();

    this.alpha = 0;

    this.size = new Vec2(12);
    this.anchor = Anchor.CenterLeft;
    this.origin = Anchor.Center;

    this.addInternal(this.#ring = new FastRoundedBox({
      alpha: 0.5,
      size: 8,
      cornerRadius: 2,
      rotation: Math.PI / 4,
      anchor: Anchor.Center,
      origin: Anchor.Center,
    }));
  }

  currentTime = 0;

  readonly #ring: Drawable;

  override onHover(e: HoverEvent): boolean {
    this.#updateState();
    return false;
  }

  override onHoverLost(e: HoverLostEvent) {
    this.#updateState();
  }

  #updateState() {
    if (this.isHovered || this.isDragged) {
      this.#ring.scaleTo(1.2, 200, EasingFunction.OutExpo);
      this.#ring.alpha = 1;
    }
    else {
      this.#ring.scaleTo(1, 200, EasingFunction.OutExpo);
      this.#ring.alpha = 0.5;
    }
  }

  #dragStartTime = 0;
  #dragStartBeatLength = 0;

  @resolved(Timeline)
  protected timeline!: Timeline;

  override onDragStart(e: DragStartEvent): boolean {
    this.#dragStartTime = this.blueprint.controlPoint!.time + this.timeline.sizeToDuration(this.x);
    this.#dragStartBeatLength = this.blueprint.controlPoint!.beatLength;
    this.#updateState();

    this.hide();

    return true;
  }

  override onDrag(e: DragEvent): boolean {
    let time = this.timeline.screenSpacePositionToTime(e.screenSpaceMousePosition);

    const end = this.blueprint.entry!.end;

    if (end && Math.abs(time - end.time) < 15)
      time = end.time;

    const oldDelta = this.#dragStartTime - this.blueprint.controlPoint!.time;
    const newDelta = time - this.blueprint.controlPoint!.time;

    const scale = newDelta / oldDelta;

    this.blueprint.controlPoint!.beatLength = clamp(this.#dragStartBeatLength * scale, 100, 5000);

    this.currentTime = time;

    return true;
  }

  override onDragEnd(e: DragEndEvent) {
    this.#updateState();
    if (this.parent!.isHovered)
      this.show();
  }

  override update() {
    super.update();

    this.x = this.timeline.timeToPosition(this.currentTime) - this.blueprint.x;
  }
}

import type { TimingPointSelectionBlueprint } from './TimingPointSelectionBlueprint';
import { Anchor, Axes, Box, clamp, CompositeDrawable, dependencyLoader, type DragEndEvent, type DragEvent, type DragStartEvent, type Drawable, type HoverEvent, type HoverLostEvent, type InputManager, resolved } from 'osucad-framework';
import { ControlPointInfo } from '../../../../controlPoints/ControlPointInfo';
import { EditorClock } from '../../../EditorClock';
import { Timeline } from '../../../ui/timeline/Timeline';
import { KeyframePiece } from '../KeyframePiece';

export class TimingPointAdjustmentBlueprint extends CompositeDrawable {
  constructor(readonly blueprint: TimingPointSelectionBlueprint) {
    super();

    this.relativeSizeAxes = Axes.Both;
  }

  #dragHandle!: DragHandle;

  @dependencyLoader()
  [Symbol('load')]() {
    this.addInternal(
      this.#dragHandle = new DragHandle(this.blueprint),
    );
  }

  protected override loadComplete() {
    super.loadComplete();

    this.#inputManager = this.getContainingInputManager()!;
  }

  #inputManager!: InputManager;

  override update() {
    super.update();

    this.#updateDragHandle();
  }

  @resolved(Timeline)
  timeline!: Timeline;

  @resolved(ControlPointInfo)
  controlPointInfo!: ControlPointInfo;

  @resolved(EditorClock)
  editorClock!: EditorClock;

  get entry() {
    return this.blueprint.entry;
  }

  #updateDragHandle() {
    let time = this.timeline.screenSpacePositionToTime(this.#inputManager.currentState.mouse.position);

    time = this.controlPointInfo.snap(time, this.editorClock.beatSnapDivisor.value);

    if (!this.#dragHandle.isDragged) {
      this.#dragHandle.currentTime = time;

      if (
        this.isHovered
        && time > this.entry!.lifetimeStart
        && time < this.entry!.lifetimeEnd
        && !this.#inputManager.currentState.keyboard.controlPressed
      ) {
        this.#dragHandle.show();
      }
      else {
        this.#dragHandle.hide();
      }
    }
  }

  override onHover(e: HoverEvent): boolean {
    if (!this.#dragHandle.isDragged)
      this.#dragHandle.show();
    return false;
  }

  override onHoverLost(e: HoverLostEvent) {
    if (!this.#dragHandle.isDragged)
      this.#dragHandle.hide();
  }
}

class DragHandle extends CompositeDrawable {
  constructor(readonly blueprint: TimingPointSelectionBlueprint) {
    super();

    this.alpha = 0;
    this.width = 10;
    this.relativeSizeAxes = Axes.Y;

    this.anchor = Anchor.CenterLeft;
    this.origin = Anchor.Center;

    this.addInternal(this.#line = new Box({
      alpha: 0.25,
      relativeSizeAxes: Axes.Y,
      width: 1,
      anchor: Anchor.Center,
      origin: Anchor.Center,
    }));
  }

  currentTime = 0;

  readonly #line: Drawable;

  override onHover(e: HoverEvent): boolean {
    this.#updateState();
    return false;
  }

  override onHoverLost(e: HoverLostEvent) {
    this.#updateState();
  }

  #updateState() {
    if (this.isHovered || this.isDragged) {
      this.#line.alpha = 0.5;
    }
    else {
      this.#line.alpha = 0.25;
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

    return true;
  }

  override onDrag(e: DragEvent): boolean {
    let time = this.timeline.screenSpacePositionToTime(e.screenSpaceMousePosition);

    const end = this.blueprint.entry!.end;

    if (end && Math.abs(time - end.time) < 15)
      time = end.time;

    const snapTarget = this.getContainingInputManager()?.hoveredDrawables.find(it => it !== this && it instanceof KeyframePiece && !it.selected.value) as KeyframePiece | undefined;
    if (snapTarget)
      time = snapTarget.blueprint.controlPoint!.time;

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

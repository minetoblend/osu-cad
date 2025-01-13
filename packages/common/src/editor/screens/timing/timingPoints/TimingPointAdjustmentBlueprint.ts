import type { DragEndEvent, DragEvent, DragStartEvent, Drawable, HoverEvent, HoverLostEvent, InputManager, KeyDownEvent, KeyUpEvent, MouseDownEvent, ReadonlyDependencyContainer } from 'osucad-framework';
import type { TimingPointSelectionBlueprint } from './TimingPointSelectionBlueprint';
import { UpdateHandler } from '@osucad/multiplayer';
import { Anchor, Axes, Box, clamp, CompositeDrawable, Key, resolved } from 'osucad-framework';
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

  protected override load(dependencies: ReadonlyDependencyContainer) {
    super.load(dependencies);

    this.addInternal(this.#dragHandle = new DragHandle(this.blueprint));
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

  #ctrlPressed = false;

  override onKeyDown(e: KeyDownEvent): boolean {
    if (e.key === Key.ControlLeft)
      this.#ctrlPressed = true;
    return false;
  }

  override onKeyUp(e: KeyUpEvent) {
    if (e.key === Key.ControlLeft)
      this.#ctrlPressed = false;
  }

  #updateDragHandle() {
    let time = this.timeline.screenSpacePositionToTime(this.#inputManager.currentState.mouse.position);

    time = this.controlPointInfo.snap(time, this.editorClock.beatSnapDivisor.value);

    if (!this.#dragHandle.isDragged) {
      this.#dragHandle.currentTime = time;

      if (
        this.isHovered
        && this.#ctrlPressed
        && time > this.entry!.lifetimeStart
        && time < this.entry!.lifetimeEnd
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

  override onMouseDown(e: MouseDownEvent): boolean {
    this.#dragStartTime = this.timeline.timeAtPosition(this.x + this.blueprint.drawPosition.x);
    this.#dragStartBeatLength = this.blueprint.controlPoint!.beatLength;
    return true;
  }

  override onDragStart(e: DragStartEvent): boolean {
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

  @resolved(UpdateHandler)
  readonly updateHandler!: UpdateHandler;

  override onDragEnd(e: DragEndEvent) {
    this.#updateState();
    if (this.parent!.isHovered)
      this.show();

    this.updateHandler.commit();
  }

  override update() {
    super.update();

    this.x = this.timeline.positionAtTime(this.currentTime) - this.blueprint.drawPosition.x;
  }
}

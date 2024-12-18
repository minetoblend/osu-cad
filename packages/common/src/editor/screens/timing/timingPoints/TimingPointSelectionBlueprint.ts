import type { DragEndEvent, DragEvent, DragStartEvent, Drawable, HoverEvent, HoverLostEvent, InputManager } from 'osucad-framework';
import type { ColorSource } from 'pixi.js';
import type { TimingPoint } from '../../../../controlPoints/TimingPoint';
import type { ControlPointLifetimeEntry } from '../../../ui/timeline/ControlPointLifetimeEntry';
import { Anchor, Bindable, BindableNumber, clamp, CompositeDrawable, dependencyLoader, EasingFunction, FastRoundedBox, resolved, Vec2 } from 'osucad-framework';
import { ControlPointInfo } from '../../../../controlPoints/ControlPointInfo';
import { EditorClock } from '../../../EditorClock';
import { Timeline } from '../../../ui/timeline/Timeline';
import { KeyframePiece } from '../KeyframePiece';
import { KeyframeSelectionBlueprint } from '../KeyframeSelectionBlueprint';
import { TimingScreenNumberBadge } from '../TimingScreenNumberBadge';

export class TimingPointSelectionBlueprint extends KeyframeSelectionBlueprint<TimingPoint> {
  constructor() {
    super();
  }

  override readonly keyframeColor = new Bindable<ColorSource>(0xFF265A);

  readonly bpmBindable = new BindableNumber(120)
    .withMinValue(1)
    .withMaxValue(10000);

  readonly meterBindable = new BindableNumber(4)
    .withMinValue(1)
    .withMaxValue(12)
    .withPrecision(1);

  @dependencyLoader()
  [Symbol('load')]() {
    this.addInternal(
      this.#dragHandle = new DragHandle(this),
    );

    this.badgeContainer.addAll(
      new TimingScreenNumberBadge({
        bindable: this.bpmBindable,
        color: this.keyframeColor.value,
        format: value => value.toFixed(2),
        suffix: 'bpm',
      }),
      new TimingScreenNumberBadge({
        bindable: this.meterBindable,
        color: this.keyframeColor.value,
        format: value => value.toFixed(0),
        suffix: '/ 4',
      }),
    );

    this.bpmBindable.addOnChangeListener((evt) => {
      if (this.controlPoint)
        this.controlPoint.bpm = evt.value;
    });
  }

  protected override onApply(entry: ControlPointLifetimeEntry<TimingPoint>) {
    super.onApply(entry);

    this.meterBindable.bindTo(entry.start.meterBindable);
  }

  protected override onFree(entry: ControlPointLifetimeEntry<TimingPoint>) {
    super.onFree(entry);

    this.meterBindable.unbindFrom(entry.start.meterBindable);
  }

  protected override controlPointChanged(controlPoint: TimingPoint) {
    super.controlPointChanged(controlPoint);

    this.bpmBindable.value = controlPoint.bpm;
  }

  @resolved(EditorClock)
  protected editorClock!: EditorClock;

  @resolved(ControlPointInfo)
  protected controlPointInfo!: ControlPointInfo;

  #inputManager!: InputManager;

  protected override loadComplete() {
    super.loadComplete();

    this.#inputManager = this.getContainingInputManager()!;
  }

  override update() {
    super.update();

    this.#updateDragHandle();
  }

  #updateDragHandle() {
    let time = this.timeline.screenSpacePositionToTime(this.#inputManager.currentState.mouse.position);

    time = this.controlPointInfo.snap(time, this.editorClock.beatSnapDivisor.value);

    if (!this.#dragHandle.isDragged) {
      this.#dragHandle.currentTime = time;

      if (time > this.entry!.lifetimeStart && time < this.entry!.lifetimeEnd && !this.#inputManager.currentState.keyboard.controlPressed)
        this.#dragHandle.show();
      else
        this.#dragHandle.hide();
    }
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
  constructor(readonly blueprint: TimingPointSelectionBlueprint) {
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

import type { ClickEvent, DoubleClickEvent, DragEndEvent, DragEvent, DragStartEvent, DrawableOptions, HoverEvent, MouseDownEvent } from 'osucad-framework';
import type { ControlPoint } from '../../../controlPoints/ControlPoint';
import type { KeyframeSelectionBlueprint } from './KeyframeSelectionBlueprint';
import { BindableBoolean, ColorUtils, dependencyLoader, EasingFunction, MouseButton, resolved } from 'osucad-framework';
import { ControlPointInfo } from '../../../controlPoints/ControlPointInfo';
import { TimingPoint } from '../../../controlPoints/TimingPoint';
import { EditorClock } from '../../EditorClock';
import { Timeline } from '../../ui/timeline/Timeline';
import { KeyframeShape } from './KeyframeShape';
import { TimingScreenSelectionManager } from './TimingScreenSelectionManager';

export class KeyframePiece extends KeyframeShape {
  constructor(
    readonly blueprint: KeyframeSelectionBlueprint<ControlPoint>,
    options: DrawableOptions = {},
  ) {
    super();

    this.with(options);
  }

  readonly selected = new BindableBoolean(false);

  get keyframeColor() {
    return this.blueprint.keyframeColor;
  }

  @dependencyLoader()
  [Symbol('load')]() {
    this.selected.valueChanged.addListener(this.#updateColor, this);
    this.keyframeColor.valueChanged.addListener(this.#updateColor, this);
    this.#updateColor();
  }

  #updateColor() {
    if (this.selected.value) {
      this.body.color = ColorUtils.lighten(this.keyframeColor.value, 0.5);
      this.outline.color = ColorUtils.lighten(this.keyframeColor.value, 1);
      this.outline.alpha = 1;
    }
    else {
      this.body.color = this.keyframeColor.value;
      this.outline.color = this.keyframeColor.value;
      this.outline.alpha = 0.5;
    }
  }

  @resolved(TimingScreenSelectionManager)
  protected selectionManager!: TimingScreenSelectionManager;

  override onClick(e: ClickEvent): boolean {
    if (e.controlPressed)
      this.selectionManager.toggleSelection(this.blueprint.controlPoint!);
    else if (!this.selected.value)
      this.selectionManager.setSelection(this.blueprint.controlPoint!);
    return true;
  }

  override onDoubleClick(e: DoubleClickEvent): boolean {
    this.selectionManager.setSelection(
      ...this.controlPointInfo.getControlPointsAtTime(this.blueprint.controlPoint!.time),
    );

    return true;
  }

  override onMouseDown(e: MouseDownEvent): boolean {
    if (e.button === MouseButton.Right) {
      this.controlPointInfo.remove(this.blueprint.controlPoint!);
      return true;
    }

    return false;
  }

  override onHover(e: HoverEvent): boolean {
    this.scaleContainer.scaleTo(1.2, 200, EasingFunction.OutExpo);
    return true;
  }

  override onHoverLost(e: HoverEvent) {
    this.scaleContainer.scaleTo(1, 200, EasingFunction.OutExpo);
  }

  override onDragStart(e: DragStartEvent): boolean {
    if (!this.selected.value)
      this.selectionManager.setSelection(this.blueprint.controlPoint!);

    return true;
  }

  @resolved(Timeline)
  protected timeline!: Timeline;

  @resolved(EditorClock)
  protected editorClock!: EditorClock;

  @resolved(ControlPointInfo)
  protected controlPointInfo!: ControlPointInfo;

  override onDrag(e: DragEvent): boolean {
    let time = this.timeline.screenSpacePositionToTime(e.screenSpaceMousePosition);

    if (!(this.blueprint.controlPoint! instanceof TimingPoint) && !e.shiftPressed) {
      time = this.controlPointInfo.snap(time, this.editorClock.beatSnapDivisor.value);
    }

    const snapTarget = this.getContainingInputManager()?.hoveredDrawables.find(it => it !== this && it instanceof KeyframePiece && !it.selected.value) as KeyframePiece | undefined;
    if (snapTarget)
      time = snapTarget.blueprint.controlPoint!.time;

    const delta = time - this.blueprint.controlPoint!.time;

    if (delta !== 0) {
      for (const controlPoint of this.selectionManager.selectedObjects) {
        controlPoint.time += delta;
      }
    }

    return true;
  }

  override onDragEnd(e: DragEndEvent) {
    this.scaleContainer.show();
  }
}

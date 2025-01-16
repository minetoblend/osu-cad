import type { ClickEvent, DoubleClickEvent, DragEndEvent, DragEvent, DragStartEvent, DrawableOptions, MouseDownEvent } from '@osucad/framework';
import type { ControlPoint } from '../../../controlPoints/ControlPoint';
import type { KeyframeSelectionBlueprint } from './KeyframeSelectionBlueprint';
import { BindableBoolean, CompositeDrawable, dependencyLoader, MouseButton, resolved } from '@osucad/framework';
import { UpdateHandler } from '@osucad/multiplayer';
import { ControlPointInfo } from '../../../controlPoints/ControlPointInfo';
import { TimingPoint } from '../../../controlPoints/TimingPoint';
import { EditorClock } from '../../EditorClock';
import { Timeline } from '../../ui/timeline/Timeline';
import { TimingScreenSelectionManager } from './TimingScreenSelectionManager';

export class KeyframePiece extends CompositeDrawable {
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
    this.selected.bindTo(this.blueprint.selected);
  }

  protected override loadComplete() {
    super.loadComplete();

    this.selected.valueChanged.addListener(this.updateColors, this);
    this.keyframeColor.valueChanged.addListener(this.updateColors, this);
    this.updateColors();
  }

  protected updateColors() {
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
      this.delete();
    }

    return true;
  }

  protected delete() {
    if (this.selected.value) {
      for (const controlPoint of [...this.selectionManager.selectedObjects])
        this.controlPointInfo.remove(controlPoint);
    }
    else {
      this.controlPointInfo.remove(this.blueprint.controlPoint!);
    }

    this.updateHandler.commit();
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

  @resolved(UpdateHandler)
  protected updateHandler!: UpdateHandler;

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
      for (const controlPoint of this.selectionManager.selectedObjects)
        controlPoint.time += delta;
    }

    return true;
  }

  override onDragEnd(e: DragEndEvent) {
    this.updateHandler.commit();
  }
}

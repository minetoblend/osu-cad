import type { DragEndEvent, DragEvent, DragStartEvent, HoverEvent, HoverLostEvent, InputManager, KeyDownEvent, KeyUpEvent, MouseDownEvent } from 'osucad-framework';
import type { ColorSource } from 'pixi.js';
import type { ControlPoint } from '../../../controlPoints/ControlPoint';
import { Anchor, Axes, CompositeDrawable, dependencyLoader, Key, MouseButton, resolved } from 'osucad-framework';
import { TextBox } from '../../../../../editor/src/userInterface/TextBox';
import { ControlPointInfo } from '../../../controlPoints/ControlPointInfo';
import { EditorClock } from '../../EditorClock';
import { LayeredTimeline } from '../../ui/timeline/LayeredTimeline';
import { Timeline } from '../../ui/timeline/Timeline';
import { KeyframeShape } from './KeyframeShape';
import { TimingScreenSelectionBlueprint } from './TimingScreenSelectionBlueprint';

export abstract class ControlPointPlacementBlueprint<T extends ControlPoint> extends CompositeDrawable {
  protected constructor() {
    super();
    this.relativeSizeAxes = Axes.Both;
  }

  protected abstract get layerColor(): ColorSource;

  #previewKeyframe!: KeyframeShape;

  protected get invertShiftBehavior() {
    return false;
  }

  @dependencyLoader()
  [Symbol('load')]() {
    this.addInternal(this.#previewKeyframe = new KeyframeShape().with({
      size: 12,
      anchor: Anchor.CenterLeft,
      origin: Anchor.Center,
      color: this.layerColor,
    }));

    this.#updateVisibility();
  }

  #inputManager!: InputManager;

  @resolved(Timeline)
  timeline!: Timeline;

  @resolved(EditorClock)
  editorClock!: EditorClock;

  @resolved(ControlPointInfo)
  controlPointInfo!: ControlPointInfo;

  protected get timeAtMousePosition() {
    let time = this.timeline.screenSpacePositionToTime(this.#inputManager.currentState.mouse.position);

    if (this.#inputManager.currentState.keyboard.shiftPressed === this.invertShiftBehavior)
      time = this.controlPointInfo.snap(time, this.editorClock.beatSnapDivisor.value);

    return time;
  }

  protected override loadComplete() {
    super.loadComplete();

    this.#inputManager = this.getContainingInputManager()!;
  }

  override update() {
    super.update();

    this.#previewKeyframe.x = this.timeline.timeToPosition(
      this.timeAtMousePosition,
    );
  }

  #ctrlPressed = false;

  #updateVisibility() {
    if (this.isHovered && this.#ctrlPressed && !this.isDragged)
      this.#previewKeyframe.alpha = 0.5;
    else
      this.#previewKeyframe.alpha = 0;
  }

  override onKeyDown(e: KeyDownEvent): boolean {
    if (e.key === Key.ControlLeft) {
      this.#ctrlPressed = true;
      this.#updateVisibility();
    }
    return false;
  }

  override onKeyUp(e: KeyUpEvent) {
    if (e.key === Key.ControlLeft) {
      this.#ctrlPressed = false;
      this.#updateVisibility();
    }
  }

  #activePlacement?: T;

  protected abstract createInstance(): T;

  protected onPlacementStart(controlPoint: T) {}

  protected onPlacementEnd(controlPoint: T) {
    const drawable = this.findClosestParentOfType(LayeredTimeline)
      ?.findChildrenOfType(TimingScreenSelectionBlueprint)
      .find(it => it.entry?.start === this.#activePlacement)
      ?.findChildrenOfType(TextBox)[0];

    if (drawable)
      this.getContainingFocusManager()?.changeFocus(drawable);
  }

  override onMouseDown(e: MouseDownEvent): boolean {
    if (e.button === MouseButton.Left && e.controlPressed) {
      this.controlPointInfo.add(this.#activePlacement = this.createInstance());
      this.#activePlacement.time = this.timeAtMousePosition;
      this.onPlacementStart(this.#activePlacement);
      this.updateControlPoint(this.#activePlacement);
      return true;
    }

    return false;
  }

  override onDragStart(e: DragStartEvent): boolean {
    return !!this.#activePlacement;
  }

  override onDrag(e: DragEvent): boolean {
    if (this.#activePlacement) {
      this.updateControlPoint(this.#activePlacement);

      return true;
    }
    return false;
  }

  protected updateControlPoint(controlPoint: T) {
    controlPoint.time = this.timeAtMousePosition;
  }

  override onDragEnd(e: DragEndEvent) {
    if (this.#activePlacement) {
      this.onPlacementEnd(this.#activePlacement);
    }
    this.#activePlacement = undefined;
  }

  override onHover(e: HoverEvent): boolean {
    this.#updateVisibility();
    return this.isDragged;
  }

  override onHoverLost(e: HoverLostEvent) {
    this.#updateVisibility();
  }

  override dispose(isDisposing: boolean = true) {
    super.dispose(isDisposing);

    if (this.#activePlacement)
      this.controlPointInfo.remove(this.#activePlacement);
  }
}

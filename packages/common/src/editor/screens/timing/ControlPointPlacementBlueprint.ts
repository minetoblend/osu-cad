import type { Bindable, DragEndEvent, DragEvent, DragStartEvent, Drawable, HoverEvent, HoverLostEvent, InputManager, KeyDownEvent, KeyUpEvent, MouseDownEvent, MouseUpEvent, ReadonlyDependencyContainer } from 'osucad-framework';
import type { ColorSource } from 'pixi.js';
import type { ControlPoint } from '../../../controlPoints/ControlPoint';
import { UpdateHandler } from '@osucad/multiplayer';
import { Anchor, Axes, dependencyLoader, Key, MouseButton, resolved } from 'osucad-framework';
import { ControlPointInfo } from '../../../controlPoints/ControlPointInfo';
import { TextBox } from '../../../userInterface/TextBox';
import { LayeredTimeline } from '../../ui/timeline/LayeredTimeline';
import { Timeline } from '../../ui/timeline/Timeline';
import { TimelinePart } from '../../ui/timeline/TimelinePart';
import { DiamondShape } from './DiamondShape';
import { TimingScreenDependencies } from './TimingScreenDependencies';
import { TimingScreenSelectionBlueprint } from './TimingScreenSelectionBlueprint';
import { TimingScreenSelectionManager } from './TimingScreenSelectionManager';
import { TimingScreenTool } from './TimingScreenTool';

export abstract class ControlPointPlacementBlueprint<T extends ControlPoint> extends TimelinePart {
  protected constructor() {
    super();
    this.relativeSizeAxes = Axes.Both;
  }

  protected abstract get layerColor(): ColorSource;

  #previewShape!: Drawable;

  protected get invertShiftBehavior() {
    return false;
  }

  @dependencyLoader()
  [Symbol('load')](dependencies: ReadonlyDependencyContainer) {
    const { activeTool } = dependencies.resolve(TimingScreenDependencies);

    this.activeTool = activeTool.getBoundCopy();

    this.add(this.#previewShape = this.createPreviewShape().with({
      relativePositionAxes: Axes.Both,
    }));

    this.activeTool.addOnChangeListener(e => this.#updateVisibility(), { immediate: true });
  }

  protected createPreviewShape(): Drawable {
    return new DiamondShape().with({
      size: 12,
      anchor: Anchor.CenterLeft,
      origin: Anchor.Center,
      color: this.layerColor,
    });
  }

  #inputManager!: InputManager;

  protected get inputManager(): InputManager {
    return this.#inputManager;
  }

  @resolved(Timeline)
  timeline!: Timeline;

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

    this.updatePreviewShapePosition(this.#previewShape);
  }

  protected updatePreviewShapePosition(shape: Drawable) {
    if (Number.isFinite(this.timeAtMousePosition))
      this.#previewShape.x = this.timeAtMousePosition;
  }

  #ctrlPressed = false;

  activeTool!: Bindable<TimingScreenTool>;

  get isActive() {
    return !this.#ctrlPressed && this.activeTool.value === TimingScreenTool.Create;
  }

  #updateVisibility() {
    if (this.isHovered && this.isActive && !this.isDragged)
      this.#previewShape.alpha = 0.5;
    else
      this.#previewShape.alpha = 0;
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

  @resolved(TimingScreenSelectionManager)
  protected selectionManager!: TimingScreenSelectionManager;

  protected abstract createInstance(): T;

  protected onPlacementStart(controlPoint: T) {
    this.#previewShape.hide();
    this.selectionManager.clear();
  }

  protected onPlacementEnd(controlPoint: T) {
    const drawable = this.findClosestParentOfType(LayeredTimeline)
      ?.findChildrenOfType(TimingScreenSelectionBlueprint)
      .find(it => it.entry?.start === this.#activePlacement)
      ?.findChildrenOfType(TextBox)[0];

    if (drawable)
      this.getContainingFocusManager()?.changeFocus(drawable);
  }

  override onMouseDown(e: MouseDownEvent): boolean {
    if (e.button === MouseButton.Left && this.isActive) {
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

  @resolved(UpdateHandler)
  updateHandler!: UpdateHandler;

  override onDragEnd(e: DragEndEvent) {
    if (this.#activePlacement) {
      this.endPlacement(this.#activePlacement);
    }

    this.#activePlacement = undefined;
  }

  override onMouseUp(e: MouseUpEvent) {
    if (e.button === MouseButton.Left && this.#activePlacement) {
      this.endPlacement(this.#activePlacement);
    }

    this.#activePlacement = undefined;
  }

  protected endPlacement(placement: T) {
    this.onPlacementEnd(placement);
    this.updateHandler.commit();
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

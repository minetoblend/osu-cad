import type { DragEndEvent, DragEvent, DragStartEvent, MouseDownEvent, ReadonlyDependencyContainer } from 'osucad-framework';
import type { Color } from 'pixi.js';
import type { HitObject } from '../../../../hitObjects/HitObject';
import type { TimelineHitObjectBlueprint } from './TimelineHitObjectBlueprint';
import { Axes, Bindable, ColorUtils, CompositeDrawable, FastRoundedBox, MouseButton, resolved } from 'osucad-framework';
import { HitObjectList } from '../../../../beatmap/HitObjectList';
import { UpdateHandler } from '../../../../crdt/UpdateHandler';
import { EditorClock } from '../../../EditorClock';
import { HitObjectSelectionManager } from '../../../screens/compose/HitObjectSelectionManager';
import { Timeline } from '../Timeline';

export class TimelineHitObjectBody extends CompositeDrawable {
  constructor(readonly blueprint: TimelineHitObjectBlueprint) {
    super();
    this.relativeSizeAxes = Axes.Both;
  }

  #body!: FastRoundedBox;

  protected accentColor = new Bindable<Color>(null!);

  get hitObject() {
    return this.blueprint.hitObject;
  }

  protected override load(dependencies: ReadonlyDependencyContainer) {
    super.load(dependencies);

    this.addInternal(
      this.#body = new FastRoundedBox({
        relativeSizeAxes: Axes.Both,
        cornerRadius: 100,
      }),
    );

    this.accentColor.bindTo(this.blueprint.accentColor);
    this.accentColor.addOnChangeListener(() => this.updateColors(), { immediate: true });
  }

  protected updateColors() {
    this.#body.color = ColorUtils.darken(this.accentColor.value, 0.25);
  }

  @resolved(HitObjectList)
  hitObjects!: HitObjectList;

  @resolved(UpdateHandler)
  updateHandler!: UpdateHandler;

  override onMouseDown(e: MouseDownEvent): boolean {
    if (e.button === MouseButton.Right) {
      if (this.isDragged)
        return false;

      this.hitObjects.remove(this.hitObject!);
      this.updateHandler.commit();
      return true;
    }

    if (e.button === MouseButton.Left) {
      this.attemptSelectionFromMouse(e);

      // in readonly mode we don't want to handle it so the drag action can be used to scroll in the timeline
      return !this.blueprint.readonly;
    }

    return false;
  }

  @resolved(HitObjectSelectionManager, true)
  selection?: HitObjectSelectionManager;

  protected attemptSelectionFromMouse(e: MouseDownEvent) {
    if (e.controlPressed)
      this.selection?.toggleSelection(this.hitObject!);
    else if (!this.blueprint.selected.value)
      this.selection?.setSelection(this.hitObject!);
  }

  @resolved(EditorClock)
  editorClock!: EditorClock;

  @resolved(Timeline)
  timeline!: Timeline;

  #dragStartTime = 0;
  #ownDragStartTime = 0;
  #draggedObjects: HitObject[] = [];
  #dragStartTimes: number[] = [];

  override onDragStart(e: DragStartEvent): boolean {
    if (!this.selection || this.blueprint.readonly)
      return false;

    this.#ownDragStartTime = this.hitObject!.startTime;
    this.#dragStartTime = this.timeline.screenSpacePositionToTime(e.screenSpaceMousePosition);
    this.#draggedObjects = [...this.selection.selectedObjects];
    this.#dragStartTimes = this.#draggedObjects.map(obj => obj.startTime);
    return true;
  }

  override onDrag(e: DragEvent): boolean {
    let delta = this.timeline.screenSpacePositionToTime(e.screenSpaceMousePosition) - this.#dragStartTime;

    let time = this.#ownDragStartTime + delta;

    if (!e.shiftPressed)
      time = this.editorClock.snap(time);

    delta = time - this.#ownDragStartTime;

    for (let i = 0; i < this.#draggedObjects.length; i++) {
      this.#draggedObjects[i].startTime = this.#dragStartTimes[i] + delta;
    }

    return true;
  }

  override onDragEnd(e: DragEndEvent) {
    this.updateHandler.commit();
  }
}

import type { ClickEvent, DragEndEvent, DragEvent, DragStartEvent, MouseDownEvent, MouseUpEvent, ReadonlyDependencyContainer } from 'osucad-framework';
import type { HitObjectSelectionEvent } from '../../../../editor/screens/compose/HitObjectSelectionManager';
import type { HitObjectLifetimeEntry } from '../../../../hitObjects/drawables/HitObjectLifetimeEntry';
import type { OsuHitObject } from '../../hitObjects/OsuHitObject';
import { Bindable, BindableBoolean, BindableNumber, MouseButton, resolved, Vec2 } from 'osucad-framework';
import { HitObjectList } from '../../../../beatmap/HitObjectList';
import { UpdateHandler } from '../../../../crdt/UpdateHandler';
import { HitObjectSelectionManager } from '../../../../editor/screens/compose/HitObjectSelectionManager';
import { HitObjectBlueprint } from '../../../ui/HitObjectBlueprint';
import { HitObjectBlueprintContainer } from '../../../ui/HitObjectBlueprintContainer';
import { Spinner } from '../../hitObjects/Spinner';
import { IPositionSnapProvider } from '../IPositionSnapProvider';

export class OsuSelectionBlueprint<T extends OsuHitObject = OsuHitObject> extends HitObjectBlueprint {
  constructor() {
    super();
    this.alwaysPresent = true;
  }

  override get hitObject() {
    return super.hitObject as T | undefined;
  }

  @resolved(HitObjectSelectionManager)
  protected selection!: HitObjectSelectionManager<OsuHitObject>;

  readonly positionBindable = new Bindable(new Vec2());
  readonly stackHeightBindable = new BindableNumber();
  readonly scaleBindable = new BindableNumber(1);
  readonly selected = new BindableBoolean();

  protected override load(dependencies: ReadonlyDependencyContainer) {
    super.load(dependencies);

    this.selected.addOnChangeListener(
      selected => this.alpha = selected.value ? 1 : 0,
      { immediate: true },
    );
  }

  protected override onApply(entry: HitObjectLifetimeEntry) {
    super.onApply(entry);

    const hitObject = entry.hitObject as T;

    this.positionBindable.bindTo(hitObject.positionBindable);
    this.stackHeightBindable.bindTo(hitObject.stackHeightBindable);
    this.scaleBindable.bindTo(hitObject.scaleBindable);

    this.selected.value = this.selection.isSelected(hitObject);

    this.selection.selectionChanged.addListener(this.#selectionChanged, this);

    // this.lifetimeStart = entry.lifetimeStart;
    // this.lifetimeEnd = entry.lifetimeEnd;
  }

  #selectionChanged(evt: HitObjectSelectionEvent) {
    if (evt.hitObject === this.hitObject)
      this.selected.value = evt.selected;
  }

  protected override onFree(entry: HitObjectLifetimeEntry) {
    super.onFree(entry);

    const hitObject = entry.hitObject as T;

    this.positionBindable.unbindFrom(hitObject.positionBindable);
    this.stackHeightBindable.unbindFrom(hitObject.stackHeightBindable);
    this.scaleBindable.unbindFrom(hitObject.scaleBindable);

    this.selection.selectionChanged.removeListener(this.#selectionChanged, this);
  }

  override receivePositionalInputAt(screenSpacePosition: Vec2): boolean {
    return this.hitObject!.contains(
      this.parent!.toLocalSpace(screenSpacePosition),
    );
  }

  #didSelect = false;

  override onMouseDown(e: MouseDownEvent): boolean {
    if (e.button === MouseButton.Left) {
      if (e.controlPressed) {
        this.selection.toggleSelection(this.hitObject!);
        return true;
      }

      if (!this.selected.value) {
        this.selection.setSelection(this.hitObject!);
        this.#didSelect = true;
      }

      return true;
    }

    if (e.button === MouseButton.Right) {
      if (this.selected.value) {
        for (const h of this.selection.selectedObjects)
          this.hitObjects.remove(h);
      }
      else {
        this.hitObjects.remove(this.hitObject!);
      }

      this.updateHandler.commit();
      return true;
    }

    return false;
  }

  @resolved(HitObjectList)
  protected hitObjects!: HitObjectList;

  override onMouseUp(e: MouseUpEvent) {
    this.schedule(() => this.#didSelect = false);
  }

  @resolved(IPositionSnapProvider)
  protected snapProvider!: IPositionSnapProvider;

  #draggedObjects: OsuHitObject[] = [];
  #dragStartTime: number = 0;
  #ownDragStartPositions: Vec2[] = [];
  #dragStartPositions: Vec2[] = [];

  override onDragStart(e: DragStartEvent): boolean {
    if (!this.selected.value)
      this.selection.setSelection(this.hitObject!);

    this.#ownDragStartPositions = this.snapPositions;
    this.#dragStartTime = this.hitObject!.startTime;

    const draggedObjects = [...this.selection.selectedObjects]
      .filter(it => !(it instanceof Spinner));

    this.#draggedObjects = draggedObjects;
    this.#dragStartPositions = draggedObjects.map(it => it.position);

    return true;
  }

  override onDrag(e: DragEvent): boolean {
    let delta = this.toParentSpace(e.screenSpaceMousePosition)
      .sub(this.toParentSpace(e.screenSpaceMouseDownPosition));

    const snapResult = IPositionSnapProvider.findClosestSnapResult(
      this.snapProvider,
      this.#ownDragStartPositions.map(it => it.add(delta)),
    );

    if (snapResult)
      delta = delta.add(snapResult.snapOffset);

    for (let i = 0; i < this.#draggedObjects.length; i++) {
      const hitObject = this.#draggedObjects[i];

      hitObject.position = this.#dragStartPositions[i].add(delta);
    }

    return true;
  }

  @resolved(UpdateHandler)
  protected updateHandler!: UpdateHandler;

  override onDragEnd(e: DragEndEvent) {
    this.updateHandler.commit();
  }

  @resolved(HitObjectBlueprintContainer)
  protected selectionContainer!: HitObjectBlueprintContainer<OsuSelectionBlueprint>;

  override onClick(e: ClickEvent): boolean {
    if (this.#didSelect)
      return false;

    if (this.selected.value && this.selection.length === 1) {
      const hoveredObjects
        = [...this.selectionContainer.allObjects]
          .filter(h => h.receivePositionalInputAt(e.screenSpaceMousePosition));

      const index = hoveredObjects.indexOf(this);
      if (index >= 0) {
        const nextObject = hoveredObjects[index + 1]?.hitObject ?? hoveredObjects[0]?.hitObject;
        if (nextObject && nextObject !== this.hitObject)
          this.selection.setSelection(nextObject as T);
      }
    }

    return false;
  }

  get snapPositions(): Vec2[] {
    return [this.hitObject!.stackedPosition];
  }
}

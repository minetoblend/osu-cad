import type { HitObjectLifetimeEntry, HitObjectSelectionEvent } from '@osucad/common';
import type { ClickEvent, DragEvent, DragStartEvent, MouseDownEvent, MouseUpEvent, ReadonlyDependencyContainer } from 'osucad-framework';
import type { OsuHitObject } from '../../hitObjects/OsuHitObject';
import type { OsuSelectionManager } from '../OsuSelectionManager';
import { EditorBeatmap, HitObjectBlueprint, HitObjectBlueprintContainer, HitObjectComposer, HitObjectSelectionManager } from '@osucad/common';
import { UpdateHandler } from '@osucad/multiplayer';
import { Axes, Bindable, BindableBoolean, BindableNumber, Container, MouseButton, resolved, Vec2 } from 'osucad-framework';
import { Spinner } from '../../hitObjects/Spinner';
import { IPositionSnapProvider } from '../IPositionSnapProvider';
import { MoveOperator } from '../operators/MoveOperator';

enum Edges {
  Left = 1 << 0,
  Right = 1 << 1,
  Top = 1 << 2,
  Bottom = 1 << 3,
}

export class OsuSelectionBlueprint<T extends OsuHitObject = OsuHitObject> extends HitObjectBlueprint {
  constructor() {
    super();
    this.alwaysPresent = true;
    this.content = new Container({
      relativeSizeAxes: Axes.Both,
    });
  }

  readonly = false;

  override get hitObject() {
    return super.hitObject as T | undefined;
  }

  @resolved(HitObjectSelectionManager)
  protected selection!: OsuSelectionManager;

  readonly positionBindable = new Bindable(new Vec2());
  readonly stackHeightBindable = new BindableNumber();
  readonly scaleBindable = new BindableNumber(1);
  readonly selected = new BindableBoolean();

  readonly content: Container;

  protected override load(dependencies: ReadonlyDependencyContainer) {
    super.load(dependencies);

    this.addInternal(this.content);

    this.selected.addOnChangeListener(
      selected => this.content.alpha = selected.value ? 1 : 0,
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

    this.selection.selectionChanged.addListener(this.selectionChanged, this);

    // this.lifetimeStart = entry.lifetimeStart;
    // this.lifetimeEnd = entry.lifetimeEnd;
  }

  protected selectionChanged(evt: HitObjectSelectionEvent) {
    if (evt.hitObject === this.hitObject)
      this.selected.value = evt.selected;
  }

  protected override onFree(entry: HitObjectLifetimeEntry) {
    super.onFree(entry);

    const hitObject = entry.hitObject as T;

    this.positionBindable.unbindFrom(hitObject.positionBindable);
    this.stackHeightBindable.unbindFrom(hitObject.stackHeightBindable);
    this.scaleBindable.unbindFrom(hitObject.scaleBindable);

    this.selection.selectionChanged.removeListener(this.selectionChanged, this);
  }

  override receivePositionalInputAt(screenSpacePosition: Vec2): boolean {
    return this.hitObject!.contains(
      this.parent!.toLocalSpace(screenSpacePosition),
    );
  }

  protected preventClickBehavior = false;

  override onMouseDown(e: MouseDownEvent): boolean {
    if (e.button === MouseButton.Left) {
      if (e.controlPressed) {
        this.selection.toggleSelection(this.hitObject!);
        return true;
      }

      if (!this.selected.value) {
        this.selection.setSelection(this.hitObject!);
        this.preventClickBehavior = true;
      }

      return true;
    }

    if (e.button === MouseButton.Right) {
      if (this.selected.value) {
        for (const h of this.selection.selectedObjects)
          this.editorBeatmap.hitObjects.remove(h);
      }
      else {
        this.editorBeatmap.hitObjects.remove(this.hitObject!);
      }

      this.updateHandler.commit();
      return true;
    }

    return false;
  }

  @resolved(EditorBeatmap)
  protected editorBeatmap!: EditorBeatmap;

  override onMouseUp(e: MouseUpEvent) {
    this.schedule(() => this.preventClickBehavior = false);
  }

  @resolved(IPositionSnapProvider, true)
  protected snapProvider?: IPositionSnapProvider;

  #draggedObjects: OsuHitObject[] = [];
  #dragStartTime: number = 0;
  #ownDragStartPositions: Vec2[] = [];
  #dragStartPositions: Vec2[] = [];

  #moveOperation?: MoveOperator;

  override onDragStart(e: DragStartEvent): boolean {
    if (this.readonly)
      return false;

    if (!this.selected.value)
      this.selection.setSelection(this.hitObject!);

    this.#ownDragStartPositions = this.snapPositions;
    this.#dragStartTime = this.hitObject!.startTime;

    const draggedObjects = [...this.selection.selectedObjects]
      .filter(it => !(it instanceof Spinner));

    this.#draggedObjects = draggedObjects;
    this.#dragStartPositions = draggedObjects.map(it => it.position.clone());

    this.#moveOperation = new MoveOperator(this.#draggedObjects);
    this.composer.beginOperator(this.#moveOperation);

    return true;
  }

  override onDrag(e: DragEvent): boolean {
    if (!this.#moveOperation)
      return false;

    let delta = this.parent!.toLocalSpace(e.screenSpaceMousePosition).sub(this.parent!.toLocalSpace(e.screenSpaceMouseDownPosition));

    if (this.snapProvider) {
      const snapResult = IPositionSnapProvider.findClosestSnapResult(
        this.snapProvider,
        this.#ownDragStartPositions.map(it => it.add(delta)),
      );

      if (snapResult)
        delta = delta.add(snapResult.snapOffset);
    }

    this.#moveOperation.delta.value = delta;

    return true;
  }

  @resolved(UpdateHandler)
  protected updateHandler!: UpdateHandler;

  @resolved(HitObjectComposer)
  composer!: HitObjectComposer;

  @resolved(HitObjectBlueprintContainer)
  protected selectionContainer!: HitObjectBlueprintContainer<OsuSelectionBlueprint>;

  override onClick(e: ClickEvent): boolean {
    if (this.preventClickBehavior)
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

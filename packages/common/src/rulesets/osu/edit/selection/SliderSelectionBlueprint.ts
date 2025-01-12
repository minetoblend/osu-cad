import type { ClickEvent, DoubleClickEvent, DragEndEvent, DragEvent, HoverEvent, HoverLostEvent, MouseDownEvent, ReadonlyDependencyContainer, Vec2 } from 'osucad-framework';
import type { HitObjectSelectionEvent } from '../../../../editor/screens/compose/HitObjectSelectionManager';
import type { HitObjectLifetimeEntry } from '../../../../hitObjects/drawables/HitObjectLifetimeEntry';
import type { HitObject } from '../../../../hitObjects/HitObject';
import type { PathType } from '../../hitObjects/PathType';
import type { Slider } from '../../hitObjects/Slider';
import { Anchor, Container, isMobile, MouseButton, provide, resolved } from 'osucad-framework';
import { UpdateHandler } from '../../../../crdt/UpdateHandler';
import { ISkinSource } from '../../../../skinning/ISkinSource';
import { OsuHitObject } from '../../hitObjects/OsuHitObject';
import { getNextControlPointType } from '../getNextControlPointType';
import { IDistanceSnapProvider } from '../IDistanceSnapProvider';
import { SliderPathVisualizer, SliderPathVisualizerHandle } from '../SliderPathVisualizer';
import { OsuSelectionBlueprint } from './OsuSelectionBlueprint';
import { SliderHeadSelectionBlueprint } from './SliderHeadSelectionBlueprint';
import { SliderTailSelectionBlueprint } from './SliderTailSelectionBlueprint';

@provide(SliderSelectionBlueprint)
export class SliderSelectionBlueprint extends OsuSelectionBlueprint<Slider> {
  constructor() {
    super();
  }

  @resolved(ISkinSource)
  protected skin!: ISkinSource;

  headCircle!: SliderHeadSelectionBlueprint;

  tailCircle!: SliderTailSelectionBlueprint;

  sliderPathContainer!: Container;

  override receivePositionalInputAt(screenSpacePosition: Vec2): boolean {
    if (!this.hitObject!.isVisibleAtTime(this.time.current)) {
      const position = this.parent!.toLocalSpace(screenSpacePosition);

      const distance = Math.min(
        position.distance(this.hitObject!.stackedPosition),
        position.distance(this.hitObject!.stackedPosition.add(this.hitObject!.path.endPosition)),
      );

      return distance < this.hitObject!.radius;
    }

    return super.receivePositionalInputAt(screenSpacePosition);
  }

  protected override load(dependencies: ReadonlyDependencyContainer) {
    super.load(dependencies);

    this.origin = Anchor.Center;
    this.size = OsuHitObject.object_dimensions;

    this.content.addAll(
      this.tailCircle = new SliderTailSelectionBlueprint(this),
      this.headCircle = new SliderHeadSelectionBlueprint(this),
    );

    this.addInternal(
      this.sliderPathContainer = new Container({
        anchor: Anchor.Center,
      }),
    );

    this.positionBindable.addOnChangeListener(() => this.updatePosition());
    this.stackHeightBindable.addOnChangeListener(() => this.updatePosition());
    this.scaleBindable.addOnChangeListener((scale) => {
      this.headCircle.scale = scale.value;
      this.tailCircle.scale = scale.value;
    });
  }

  protected override onApply(entry: HitObjectLifetimeEntry) {
    super.onApply(entry);

    const hitObject = entry.hitObject as Slider;

    hitObject.path.invalidated.addListener(this.updatePosition, this);
  }

  protected override onFree(entry: HitObjectLifetimeEntry) {
    super.onFree(entry);

    const hitObject = entry.hitObject as Slider;

    hitObject.path.invalidated.addListener(this.updatePosition, this);
  }

  protected override onDefaultsApplied(hitObject: HitObject) {
    super.onDefaultsApplied(hitObject);

    this.updatePosition();
  }

  protected updatePosition() {
    this.scheduler.addOnce(this.#updatePositions, this);
  }

  override onMouseDown(e: MouseDownEvent): boolean {
    if (e.button === MouseButton.Left) {
      if (this.selected.value) {
        this.selection.setSelectionType(this.hitObject!, 'body');

        return true;
      }
    }

    return super.onMouseDown(e);
  }

  protected override selectionChanged(evt: HitObjectSelectionEvent) {
    super.selectionChanged(evt);

    this.scheduler.addOnce(this.#updateSliderPathVisibility, this);
    this.scheduler.addOnce(this.#updateEdgeSelection, this);
  }

  override onHover(e: HoverEvent): boolean {
    this.#updateSliderPathVisibility();
    return true;
  }

  override onHoverLost(e: HoverLostEvent) {
    this.#updateSliderPathVisibility();
  }

  #updateSliderPathVisibility() {
    const isOnlySelectedObject = this.selected.value && this.selection.length === 1;
    const isHoveredWithNoSelection = this.isHovered && this.selection.length === 0;

    if (isOnlySelectedObject || isHoveredWithNoSelection) {
      if (this.sliderPathContainer.children.length === 0) {
        this.sliderPathContainer.add(
          new SliderSelectionPathVisualizer(this.hitObject!)
            .adjust(it => it.updatePosition = false),
        );
      }
    }
    else {
      this.sliderPathContainer.clear();
    }
  }

  #updatePositions() {
    this.position = this.hitObject!.stackedPosition;
    this.tailCircle.position = this.hitObject!.path.endPosition;
  }

  override get snapPositions(): Vec2[] {
    return [
      this.hitObject!.stackedPosition,
      this.hitObject!.stackedPosition.add(this.hitObject!.path.endPosition),
    ];
  }

  #updateEdgeSelection() {
    const selection = this.selection.getSelectionType(this.hitObject!);

    const headSelected = selection === 'head' || (typeof selection === 'number' && selection % 2 === 0);
    const tailSelected = selection === 'tail' || (typeof selection === 'number' && selection % 2 === 1);

    this.headCircle.color = headSelected ? 0xFF0000 : 0xFFFFFF;
    this.tailCircle.color = tailSelected ? 0xFF0000 : 0xFFFFFF;
  }
}

class SliderSelectionPathVisualizer extends SliderPathVisualizer {
  protected override createHandle(type: PathType | null, index: number): SliderPathVisualizerHandle {
    return new SliderSelectionPathHandle(type, index);
  }
}

class SliderSelectionPathHandle extends SliderPathVisualizerHandle {
  @resolved(SliderSelectionBlueprint)
  blueprint!: SliderSelectionBlueprint;

  @resolved(IDistanceSnapProvider, true)
  distanceSnapProvider?: IDistanceSnapProvider;

  @resolved(UpdateHandler)
  updateHandler!: UpdateHandler;

  override onMouseDown(e: MouseDownEvent): boolean {
    if (this.blueprint.readonly)
      return false;

    if (e.button === MouseButton.Left)
      return true;

    if (e.button === MouseButton.Right) {
      const slider = this.blueprint.hitObject!;

      if (slider.controlPoints.length > 2) {
        slider.removeControlPoint(this.index);
        if (this.distanceSnapProvider)
          slider.expectedDistance = this.distanceSnapProvider.findSnappedDistance(slider);
        this.updateHandler.commit();
      }

      return true;
    }

    return false;
  }

  override onDragStart(e: DragEvent): boolean {
    return !this.blueprint.readonly;
  }

  override onDrag(e: DragEvent): boolean {
    const slider = this.blueprint.hitObject;
    if (!slider)
      return false;

    const path = [...slider.controlPoints];
    const controlPoint = path[this.index];

    const delta = e.parentSpaceDelta(this);

    if (this.index === 0) {
      const deltaInv = delta.scale(-1);

      for (let i = 1; i < path.length; i++) {
        path[i] = path[i].moveBy(deltaInv);
      }
      slider.moveBy(delta);
    }
    else {
      path[this.index] = path[this.index].moveBy(delta);
    }

    slider.controlPoints = path;
    if (this.distanceSnapProvider)
      slider.expectedDistance = this.distanceSnapProvider.findSnappedDistance(slider);

    return true;
  }

  override onDragEnd(e: DragEndEvent) {
    this.updateHandler.commit();
  }

  override onClick(e: ClickEvent): boolean {
    return true;
  }

  override onDoubleClick(e: DoubleClickEvent): boolean {
    if (this.blueprint.readonly)
      return false;

    if (isMobile.any) {
      const slider = this.blueprint.hitObject;
      if (!slider)
        return false;

      const path = [...slider.controlPoints];

      const type = getNextControlPointType(path[this.index].type, this.index);

      path[this.index] = path[this.index].withType(type);

      slider.controlPoints = path;
      if (this.distanceSnapProvider)
        slider.expectedDistance = this.distanceSnapProvider.findSnappedDistance(slider);
      this.updateHandler.commit();

      return true;
    }

    return false;
  }

  override onHover(): boolean {
    super.onHover();
    return false;
  }
}

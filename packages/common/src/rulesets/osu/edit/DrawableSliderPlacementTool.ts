import type { HoverEvent, MouseDownEvent, MouseMoveEvent, MouseUpEvent, ReadonlyDependencyContainer } from 'osucad-framework';
import { InputKey, MouseButton, provide, Vec2 } from 'osucad-framework';
import { ModifierType, ToolModifier } from '../../../editor/screens/compose/ToolModifier';
import { PathPoint } from '../hitObjects/PathPoint';
import { PathType } from '../hitObjects/PathType';
import { Slider } from '../hitObjects/Slider';
import { SliderPathBuilder } from '../hitObjects/SliderPathBuilder';
import { SliderPathUtils } from '../hitObjects/SliderPathUtils';
import { DrawableOsuHitObjectPlacementTool } from './DrawableOsuHitObjectPlacementTool';
import { SliderPathVisualizer } from './SliderPathVisualizer';

export enum SliderPlacementMode {
  PlacingObject,
  PlacingPath,
}

@provide(DrawableSliderPlacementTool)
export class DrawableSliderPlacementTool extends DrawableOsuHitObjectPlacementTool<Slider> {
  protected override createHitObject(): Slider {
    return new Slider();
  }

  protected sliderPath!: SliderPathBuilder;

  protected currentPosition = new Vec2();

  protected placementMode = SliderPlacementMode.PlacingObject;

  protected readonly sliderPathVisualizer = new SliderPathVisualizer();

  protected readonly beginPlacementModifier = new ToolModifier(InputKey.MouseLeftButton, 'Begin placement', ModifierType.Action);
  protected readonly endPlacementModifier = new ToolModifier(InputKey.MouseRightButton, 'End placement', ModifierType.Action);
  protected readonly cycleCurveTypeModifier = new ToolModifier(InputKey.Tab, 'Cycle curve type', ModifierType.Action);
  protected readonly toggleNewComboModifier = new ToolModifier(InputKey.MouseRightButton, 'Toggle new combo', ModifierType.Action);
  protected readonly beginSegmentModifier = new ToolModifier(InputKey.Control, 'Begin new segment', ModifierType.Temporary);

  override getModifiers(): ToolModifier[] {
    if (this.isPlacing) {
      const modifiers: ToolModifier[] = [];

      modifiers.push(this.endPlacementModifier);

      if (this.placementMode === SliderPlacementMode.PlacingPath) {
        modifiers.push(
          this.beginSegmentModifier,
          this.cycleCurveTypeModifier,
        );
      }

      return modifiers;
    }

    return [
      this.beginPlacementModifier,
      this.toggleNewComboModifier,
    ];
  }

  protected get mergeThreshold() {
    if (this.lastInputWasTouch)
      return 25;

    return 10;
  }

  protected override load(dependencies: ReadonlyDependencyContainer) {
    super.load(dependencies);

    this.playfieldOverlay.add(this.sliderPathVisualizer);

    this.cycleCurveTypeModifier.activated.addListener(this.#cycleCurveType, this);
  }

  #cycleCurveType() {
    if (!this.isPlacing)
      return;

    const { segmentStart, segmentType } = SliderPathUtils.getLastSegment(this.sliderPath.controlPoints);

    this.sliderPath.setType(segmentStart, this.getNextPathType(segmentType, 0));
    this.updateSliderPath();
  }

  protected override beginPlacement() {
    super.beginPlacement();

    this.sliderPathVisualizer.slider = this.hitObject;

    this.sliderPath = new SliderPathBuilder([
      new PathPoint(Vec2.zero(), PathType.Bezier),
    ]);

    this.hitObject.position = this.snappedMousePosition;
  }

  protected override endPlacement() {
    super.endPlacement();
  }

  protected beginPlacingNewPoint() {
    const controlPoints = [...this.sliderPath.controlPoints, new PathPoint(this.currentPosition)];

    this.updatePathTypeFromSegmentLength(controlPoints);

    this.sliderPath.setPath(controlPoints);

    if (this.beginSegmentModifier.isActive.value)
      this.sliderPath.setType(-1, PathType.Bezier);

    this.updateSliderPath(true);
  }

  override onMouseDown(e: MouseDownEvent): boolean {
    if (e.button === MouseButton.Right) {
      if (this.isPlacing)
        this.endPlacement();
      else
        this.hitObject.newCombo = !this.hitObject.newCombo;

      return true;
    }

    if (e.button === MouseButton.Left) {
      this.#mouseDown = true;

      if (!this.isPlacing) {
        this.beginPlacement();
        this.placementMode = SliderPlacementMode.PlacingObject;

        return true;
      }

      if (this.lastInputWasTouch)
        this.setControlPointPosition(this.playfieldMousePosition);

      if (this.currentPosition.distance(this.sliderPath.last) <= this.mergeThreshold)
        this.preventPlacingNewPoint = this.tryCyclePathTypeFromMouse();

      return true;
    }

    return false;
  }

  protected preventPlacingNewPoint = false;

  protected tryCyclePathTypeFromMouse(): boolean {
    if (this.currentPosition.distance(this.sliderPath.last) > this.mergeThreshold)
      return false;

    const newType = this.getNextPathType(this.sliderPath.last.type, this.sliderPath.lastIndex);

    this.sliderPath.setType(-1, newType);
    this.updateSliderPath();

    return true;
  }

  override onMouseUp(e: MouseUpEvent) {
    if (e.button !== MouseButton.Left)
      return;

    this.#mouseDown = false;

    if (this.placementMode === SliderPlacementMode.PlacingObject) {
      this.placementMode = SliderPlacementMode.PlacingPath;
      this.updateModifiers();

      return;
    }

    if (this.preventPlacingNewPoint) {
      this.preventPlacingNewPoint = false;
      return;
    }

    this.beginPlacingNewPoint();
  }

  #mouseDown = false;

  override onMouseMove(e: MouseMoveEvent): boolean {
    if (!this.isPlacing)
      return false;

    if (!this.#mouseDown && this.lastInputWasTouch)
      return false;

    switch (this.placementMode) {
      case SliderPlacementMode.PlacingObject:
        this.hitObject.position = this.snappedMousePosition;
        break;

      case SliderPlacementMode.PlacingPath:
        this.setControlPointPosition(this.playfieldMousePosition);
        break;
    }

    return true;
  }

  override update() {
    super.update();

    if (!this.isPlacing)
      this.hitObject.position = this.snapPosition(this.playfieldMousePosition);
  }

  protected setControlPointPosition(position: Vec2) {
    this.currentPosition = position.sub(this.hitObject.position);
    this.scheduler.addOnce(this.updateSliderPath, this);
  }

  protected updatePathTypeFromSegmentLength(controlPoints: PathPoint[]): boolean {
    const { segmentStart, segmentLength, segmentType } = SliderPathUtils.getLastSegment(controlPoints);

    switch (segmentLength) {
      case 3:
        if (segmentType === PathType.Bezier)
          controlPoints[segmentStart] = controlPoints[segmentStart].withType(PathType.PerfectCurve);
        return true;
      case 4:
        if (segmentType === PathType.PerfectCurve)
          controlPoints[segmentStart] = controlPoints[segmentStart].withType(PathType.Bezier);
        return true;
      default:
        return false;
    }
  }

  protected updateSliderPath(preventMerge = false) {
    const controlPoints = [...this.sliderPath.controlPoints];

    if (this.currentPosition.distance(this.sliderPath.last) <= this.mergeThreshold) {
      const lastPoint = this.sliderPath.get(-1);

      this.updatePathTypeFromSegmentLength(controlPoints);

      if (!preventMerge && lastPoint.type === null)
        controlPoints[controlPoints.length - 1] = lastPoint.withType(PathType.Bezier);
    }
    else {
      controlPoints.push(new PathPoint(this.currentPosition));

      this.updatePathTypeFromSegmentLength(controlPoints);
    }

    this.hitObject.controlPoints = controlPoints;
    this.hitObject.snapLength(this.controlPointInfo, this.beatDivisor);
  }

  override onHover(e: HoverEvent): boolean {
    // Block hover events so nothing gets passed to the selection blueprints
    return false;
  }
}

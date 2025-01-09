import type { HoverEvent, MouseDownEvent, MouseMoveEvent, MouseUpEvent, ReadonlyDependencyContainer } from 'osucad-framework';
import { MouseButton, provide, Vec2 } from 'osucad-framework';
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
  protected readonly sliderPathVisualizer = new SliderPathVisualizer();

  protected override createHitObject(): Slider {
    return new Slider();
  }

  protected sliderPath!: SliderPathBuilder;

  protected currentPosition = new Vec2();

  protected placementMode = SliderPlacementMode.PlacingObject;

  protected get mergeThreshold() {
    if (this.lastInputWasTouch)
      return 25;

    return 10;
  }

  protected override load(dependencies: ReadonlyDependencyContainer) {
    super.load(dependencies);

    this.addInternal(this.sliderPathVisualizer);
  }

  protected override beginPlacement() {
    super.beginPlacement();

    this.sliderPathVisualizer.slider = this.hitObject;

    this.sliderPath = new SliderPathBuilder([
      new PathPoint(Vec2.zero(), PathType.Bezier),
    ]);

    this.hitObject.position = this.snappedMousePosition;
  }

  protected beginPlacingNewPoint() {
    const controlPoints = [...this.sliderPath.controlPoints, new PathPoint(this.currentPosition)];

    this.updatePathTypeFromSegmentLength(controlPoints);

    this.sliderPath.setPath(controlPoints);

    this.updateSliderPath();
  }

  protected didCyclePathType = false;

  override onMouseDown(e: MouseDownEvent): boolean {
    if (e.button === MouseButton.Right) {
      this.endPlacement();

      return true;
    }

    if (e.button === MouseButton.Left) {
      if (!this.isPlacing) {
        this.beginPlacement();
        this.placementMode = SliderPlacementMode.PlacingObject;

        return true;
      }

      if (this.currentPosition.distance(this.sliderPath.last) <= this.mergeThreshold)
        return this.didCyclePathType = this.tryCyclePathTypeFromMouse();
    }

    return false;
  }

  protected tryCyclePathTypeFromMouse(): boolean {
    if (this.currentPosition.distance(this.sliderPath.last) > this.mergeThreshold)
      return false;

    const newType = this.getNextControlPointType(this.sliderPath.last.type, this.sliderPath.lastIndex);

    this.sliderPath.setType(-1, newType);
    this.updateSliderPath();

    return true;
  }

  override onMouseUp(e: MouseUpEvent) {
    if (e.button !== MouseButton.Left)
      return;

    if (this.placementMode === SliderPlacementMode.PlacingObject) {
      this.placementMode = SliderPlacementMode.PlacingPath;
      return;
    }

    if (this.tryCyclePathTypeFromMouse())
      return;

    this.beginPlacingNewPoint();
  }

  override onMouseMove(e: MouseMoveEvent): boolean {
    if (!this.isPlacing)
      return false;

    switch (this.placementMode) {
      case SliderPlacementMode.PlacingObject:
        this.hitObject.position = this.snappedMousePosition;
        break;

      case SliderPlacementMode.PlacingPath:
        this.setControlPointPosition(this.snappedMousePosition);
        break;
    }

    return true;
  }

  override update() {
    super.update();

    if (!this.isPlacing)
      this.hitObject.position = this.snapPosition(this.mousePosition);
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

  protected updateSliderPath() {
    const controlPoints = [...this.sliderPath.controlPoints];

    if (this.currentPosition.distance(this.sliderPath.last) <= this.mergeThreshold) {
      const lastPoint = this.sliderPath.get(-1);

      this.updatePathTypeFromSegmentLength(controlPoints);

      if (lastPoint.type === null)
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
    return true;
  }
}

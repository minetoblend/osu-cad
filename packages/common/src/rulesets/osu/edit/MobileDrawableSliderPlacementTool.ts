import type { ClickEvent, DragEvent, DragStartEvent, MouseDownEvent, MouseMoveEvent, TouchMoveEvent } from 'osucad-framework';
import { MouseButton, resolved, Vec2 } from 'osucad-framework';
import { PathPoint } from '../hitObjects/PathPoint';
import { PathType } from '../hitObjects/PathType';
import { SliderPathBuilder } from '../hitObjects/SliderPathBuilder';
import { DrawableSliderPlacementTool } from './DrawableSliderPlacementTool';
import { SliderPathVisualizer, SliderPathVisualizerHandle } from './SliderPathVisualizer';

export class MobileDrawableSliderPlacementTool extends DrawableSliderPlacementTool {
  override path = new SliderPathBuilder([
    new PathPoint(new Vec2(), PathType.Bezier),
  ]);

  protected override createSliderPathVisualizer(): SliderPathVisualizer {
    return new MobileSliderPathVisualizer();
  }

  protected override endPlacement() {
    super.endPlacement();

    this.path = new SliderPathBuilder([
      new PathPoint(new Vec2(), PathType.Bezier),
    ]);
  }

  override onMouseMove(e: MouseMoveEvent): boolean {
    return false;
  }

  #updatePath() {
    this.hitObject.controlPoints = this.path.controlPoints;
    this.hitObject.expectedDistance = this.distanceSnapProvider.findSnappedDistance(this.hitObject);
  }

  override onTouchMove(e: TouchMoveEvent): boolean {
    if (this.path.length === 1) {
      this.hitObject.position = this.snappedMousePosition;
      return true;
    }

    if (this.isPlacingPoint) {
      this.path.setPosition(-1, this.controlPointPlacementPosition);

      this.#updatePath();
    }

    return true;
  }

  override beginPlacingPathPoint() {
    const position = this.controlPointPlacementPosition;

    this.isPlacingPoint = true;
    this.path.append(new PathPoint(position));

    if (this.segmentLength === 3 && this.segmentType === PathType.Bezier)
      this.path.setType(this.segmentStart, PathType.PerfectCurve);
    else if (this.segmentLength === 4 && this.segmentType === PathType.PerfectCurve)
      this.path.setType(this.segmentStart, PathType.Bezier);

    this.#updatePath();
  }

  override endPlacingPoint() {
    this.isPlacingPoint = false;
  }

  protected override get receiveInputEverywhere(): boolean {
    return this.isPlacingPoint;
  }

  override onMouseDown(e: MouseDownEvent): boolean {
    if (e.button === MouseButton.Right) {
      return true;
    }

    return super.onMouseDown(e);
  }
}

class MobileSliderPathVisualizer extends SliderPathVisualizer {
  protected override createHandle(type: PathType | null, index: number): SliderPathVisualizerHandle {
    return new SliderPlacementPathHandle(type, index);
  }
}

class SliderPlacementPathHandle extends SliderPathVisualizerHandle {
  constructor(type: PathType | null, index: number) {
    super(type, index);
    this.size = new Vec2(20);
    this.scale = 1.2;
  }

  @resolved(DrawableSliderPlacementTool)
  tool!: DrawableSliderPlacementTool;

  get isLastPoint() {
    return this.index === this.tool.path.length - 1;
  }

  override onMouseDown(e: MouseDownEvent): boolean {
    if (e.button === MouseButton.Left)
      return true;

    if (e.button === MouseButton.Right && this.tool.path.length > 2) {
      if (this.tool.isPlacingPoint)
        return false;

      const path = this.tool.path;

      if (this.index === 0) {
        const offset = path.get(1).position;

        for (let i = 1; i < path.length; i++)
          path.moveBy(i, offset.scale(-1));

        this.tool.hitObject.position = this.tool.hitObject.position.add(offset);
      }

      path.remove(this.index);
      this.tool.updatePath();

      return true;
    }

    return false;
  }

  override onClick(e: ClickEvent): boolean {
    const type = this.tool.getNextControlPointType(
      this.type,
      this.index,
    );

    this.tool.path.setType(this.index, type);
    this.tool.updatePath();

    return true;
  }

  override onDragStart(e: DragStartEvent): boolean {
    return true;
  }

  override onDrag(e: DragEvent): boolean {
    const position = this.tool.controlPointPlacementPosition;

    this.tool.path.setPosition(this.index, position);
    this.tool.updatePath();

    return true;
  }
}

import { HitObjectPlacementTool, PlacementState } from "../HitObjectPlacementTool";
import { PathPoint, PathType, Slider } from "../../../hitObjects";
import type { ClickEvent, MouseDownEvent } from "@osucad/framework";
import { MouseButton, Vec2 } from "@osucad/framework";
import { SliderPathVisualizer } from "./SliderPathVisualizer";
import { getBezierSlice } from "./pathManipulation";

export class SliderTool extends HitObjectPlacementTool<Slider>
{
  protected override createHitObject(): Slider
  {
    return new Slider();
  }

  protected override loadComplete(): void
  {
    super.loadComplete();

    this.addInternal(new SliderPathVisualizer(this.hitObject));
  }

  path: PathPoint[] = [new PathPoint(Vec2.zero(), PathType.Bezier)];

  private get segmentStart()
  {
    return this.path.findLastIndex(it => it.type !== null);
  }

  protected override updateTimeAndPosition(hitObject: Slider, time: number, position: Vec2): void
  {
    if (this.state === PlacementState.Idle)
    {
      hitObject.position = position;
      hitObject.startTime = time;
      return;
    }

    position = position.sub(hitObject.stackedPosition);

    const lastPoint = this.path[this.path.length - 1];

    if (position.distance(lastPoint.position) < 10)
    {
      this.hitObject.path.controlPoints = this.path.slice(0, -1).concat(lastPoint.withNextType(this.path.length - 1));
      this.hitObject.snapPathLength(this.beatmap.controlPointInfo, this.beatDivisor.value);
      return;
    }

    const path = [...this.path, new PathPoint(position)];

    this.applyAutomaticPathType(path);

    this.hitObject.path.controlPoints = path;
    this.hitObject.snapPathLength(this.beatmap.controlPointInfo, this.beatDivisor.value);
  }

  private applyAutomaticPathType(path: PathPoint[])
  {
    const segmentStart = this.segmentStart;

    if (path.length - segmentStart === 3)
      path[segmentStart] = path[segmentStart].withType(PathType.PerfectCurve);
    else if(path.length === 4 && path[segmentStart].type === PathType.PerfectCurve)
      path[segmentStart] = path[segmentStart].withType(PathType.Bezier);
  }

  get pathPosition()
  {
    return this.playfieldMousePosition.sub(this.hitObject.stackedPosition);
  }

  override onMouseDown(e: MouseDownEvent)
  {
    if (e.button === MouseButton.Right)
    {
      this.endPlacement(true);
    }

    return true;
  }

  override onClick(e: ClickEvent): boolean
  {
    if (!this.isPlacementActive)
    {
      this.beginPlacement();
      return true;
    }

    const position = this.pathPosition;
    if (position.distance(this.path[this.path.length - 1].position) < 10)
    {
      const lastIndex = this.path.length - 1;
      this.path[lastIndex] = this.path[lastIndex].withNextType(lastIndex);
      return true;
    }

    this.path.push(new PathPoint(position));

    this.applyAutomaticPathType(this.path);

    return true;
  }
}

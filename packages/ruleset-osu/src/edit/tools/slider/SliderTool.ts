import { PlacementState } from "../HitObjectPlacementTool";
import { PathPoint, PathType, Slider } from "../../../hitObjects";
import type { ClickEvent, KeyDownEvent, MouseDownEvent, ScrollEvent } from "@osucad/framework";
import { dependencyLoader, Key, MouseButton, resolved, Vec2 } from "@osucad/framework";
import { SliderPathVisualizer } from "./SliderPathVisualizer";
import type { ISliderToolPresence } from "./HitCircleToolPresence";
import { SliderToolPresenceOverlay } from "./HitCircleToolPresence";
import { OsuHitObjectPlacementTool } from "../OsuHitObjectPlacementTool";
import { OsuPlayfield } from "../../../ui";
import { PathTypeChangeIndicator } from "./PathTypeChangeIndicator";

export class SliderTool extends OsuHitObjectPlacementTool<Slider>
{
  protected override createHitObject(): Slider
  {
    return new Slider();
  }

  #pathText!: PathTypeChangeIndicator;
  #explicitPathType = false;

  @resolved(SnapManager)
  accessor #snapManager!: SnapManager

  @dependencyLoader()
  #load()
  {
    this.addInternal(this.#pathText = new PathTypeChangeIndicator());
  }

  protected override loadComplete(): void
  {
    super.loadComplete();

    this.addInternal(new SliderPathVisualizer(this.hitObject).with({
      depth: 1,
    }));
  }

  #path: PathPoint[] = [new PathPoint(Vec2.zero(), PathType.Bezier)];

  private get segmentStart()
  {
    return this.#path.findLastIndex(it => it.type !== null);
  }

  protected override updateTimeAndPosition(hitObject: Slider, time: number, position: Vec2): void
  {
    if (this.state === PlacementState.Idle)
    {
      const snapResult = this.#snapManager.getClosestSnapResult({
        points: [position],
        snapTo: {
          hitObjects: {
            exclude: [this.hitObject],
          },
        },
        maxDistance: 10,
      });

      if (snapResult)
        position = snapResult.position;

      hitObject.position = position.clamp(OsuPlayfield.BOUNDS);
      hitObject.startTime = time;
      return;
    }

    position = position.sub(hitObject.stackedPosition);

    const lastPoint = this.#path[this.#path.length - 1];

    if (position.distance(lastPoint.position) < 10)
    {
      this.hitObject.controlPoints = [...this.#path];
      this.hitObject.snapPathLength(this.beatmap.controlPointInfo, this.beatDivisor.value);
      return;
    }

    const path = [...this.#path, new PathPoint(position)];

    if (!this.#explicitPathType)
      this.applyAutomaticPathType(path);

    this.hitObject.controlPoints = path;
    this.hitObject.snapPathLength(this.beatmap.controlPointInfo, this.beatDivisor.value);

    let repeatCount = 0;

    if (time - this.hitObject.startTime > 0)
      repeatCount = Math.floor((time - this.hitObject.startTime) / this.hitObject.spanDuration());

    this.hitObject.repeatCount = Math.max(repeatCount, 0);
  }

  private applyAutomaticPathType(path: PathPoint[])
  {
    const segmentStart = path.findLastIndex(it => it.type !== null);

    if (path.length - segmentStart === 3 && path[segmentStart].type === PathType.Bezier)
      path[segmentStart] = path[segmentStart].withType(PathType.PerfectCurve);
    else if(path.length - segmentStart === 4 && path[segmentStart].type === PathType.PerfectCurve)
      path[segmentStart] = path[segmentStart].withType(PathType.Bezier);
  }

  public get pathPosition()
  {
    return this.playfieldMousePosition.sub(this.hitObject.stackedPosition);
  }

  protected override onMouseDown(e: MouseDownEvent)
  {
    if (e.button === MouseButton.Right)
    {
      if (!this.isPlacementActive)
        this.hitObject.newCombo = !this.hitObject.newCombo;
      else
        this.endPlacement(true);
    }

    return true;
  }

  protected override onClick(e: ClickEvent): boolean
  {
    if (!this.isPlacementActive)
    {
      this.beginPlacement();
      return true;
    }

    const position = this.pathPosition;
    if (position.distance(this.#path[this.#path.length - 1].position) < 10)
    {
      const lastIndex = this.#path.length - 1;

      this.#path[lastIndex] = this.#path[lastIndex].withNextType(lastIndex);


      if (this.#path[lastIndex].type !== null)
        this.#flashPathType(this.#path[lastIndex].type, this.#path[lastIndex].position);
      return true;
    }

    this.#path.push(new PathPoint(position));

    this.applyAutomaticPathType(this.#path);

    this.#explicitPathType = false;

    return true;
  }

  public override getPresence(): ISliderToolPresence
  {
    return {
      state: this.state,
      scale: this.hitObject.scale,
      position: { ...this.hitObject.position },
      id: this.hitObject.id,
    };
  }

  protected override onKeyDown(e: KeyDownEvent)
  {
    if (e.key === Key.Backspace)
    {
      if (this.#path.length > 1)
        this.#path = this.#path.slice(0, -1);
    }

    return false;
  }

  protected override onScroll(e: ScrollEvent)
  {
    if (e.shiftPressed && e.scrollDelta.y !== 0)
    {
      const segmentStart = this.segmentStart;
      if (segmentStart < 0)
        return true;

      const path = [...this.#path, new PathPoint(this.pathPosition)];

      if (!this.#explicitPathType)
        this.applyAutomaticPathType(path);

      this.#explicitPathType = true;

      const point = path[segmentStart];

      const newType = e.scrollDelta.y > 0 ? PathType.next(point.type!) : PathType.previous(point.type!);

      path[segmentStart] = point.withType(newType);

      this.#path = path.slice(0, -1);

      this.#flashPathType(newType, point.position);

      return true;
    }

    return false;
  }

  #flashPathType(type: PathType, position: Vec2)
  {
    this.#pathText.flashPathType(type, this.playfield.toScreenSpace(this.hitObject.stackedPosition.add(position)));
  }
}

import iconUrl from "./icon.png";
import { SnapManager } from "../../SnapManager";

export namespace SliderTool
{
  export const id = "slider";
  export const label = "Slider";
  export const tool = SliderTool;
  export const icon = iconUrl;
  export const presenceOverlay = SliderToolPresenceOverlay;
}

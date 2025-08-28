import { PlacementState } from "../HitObjectPlacementTool";
import { PathPoint, PathType, Slider } from "../../../hitObjects";
import type { ClickEvent, MouseDownEvent, ScrollEvent } from "@osucad/framework";
import { almostEquals, Anchor, Axes, Box, CompositeDrawable, dependencyLoader, MouseButton, SpriteText, Vec2 } from "@osucad/framework";
import { SliderPathVisualizer } from "./SliderPathVisualizer";
import type { ISliderToolPresence } from "./HitCircleToolPresence";
import type { ColorSource } from "pixi.js";
import { OsuHitObjectPlacementTool } from "../OsuHitObjectPlacementTool";

export class SliderTool extends OsuHitObjectPlacementTool<Slider>
{
  protected override createHitObject(): Slider
  {
    return new Slider();
  }

  #pathText!: PathText;

  @dependencyLoader()
  #load()
  {
    this.addInternal(this.#pathText = new PathText());
  }

  protected override loadComplete(): void
  {
    super.loadComplete();

    this.addInternal(new SliderPathVisualizer(this.hitObject).with({
      depth: 1,
    }));
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
      this.hitObject.path.controlPoints = [...this.path];
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
    const segmentStart = path.findLastIndex(it => it.type !== null);

    if (path.length - segmentStart === 3 && path[segmentStart].type === PathType.Bezier)
      path[segmentStart] = path[segmentStart].withType(PathType.PerfectCurve);
    else if(path.length - segmentStart === 4 && path[segmentStart].type === PathType.PerfectCurve)
      path[segmentStart] = path[segmentStart].withType(PathType.Bezier);
  }

  get pathPosition()
  {
    return this.playfieldMousePosition.sub(this.hitObject.stackedPosition);
  }

  protected override onPlacementBegin(): void
  {
    const time = this.hitObject.startTime;

    const toDelete = this.beatmap.hitObjects.filter(it => almostEquals(it.startTime, time, 1) && it !== this.hitObject);

    for (const h of toDelete)
      this.beatmap.hitObjects.remove(h);
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


      if (this.path[lastIndex].type !== null)
        this.#flashPathType(this.path[lastIndex].type, this.path[lastIndex].position);
      return true;
    }

    this.path.push(new PathPoint(position));

    this.applyAutomaticPathType(this.path);

    return true;
  }

  override getPresence(): ISliderToolPresence
  {
    return {
      state: this.state,
      scale: this.hitObject.scale,
      position: { ...this.hitObject.position },
      id: this.hitObject.id,
    };
  }

  override onScroll(e: ScrollEvent)
  {
    if (e.shiftPressed && e.scrollDelta.y !== 0)
    {
      const segmentStart = this.segmentStart;
      if (segmentStart < 0)
        return true;

      const point = this.path[segmentStart];

      const newType = e.scrollDelta.y > 0 ? PathType.next(point.type!) : PathType.previous(point.type!);

      this.path[segmentStart] = point.withType(newType);

      this.#flashPathType(newType, point.position);

      return true;
    }

    return false;
  }

  #flashPathType(type: PathType, position: Vec2)
  {
    switch (type)
    {
    case PathType.PerfectCurve:
      this.#pathText.text = "Perfect Curve";
      break;
    case PathType.BSpline:
      this.#pathText.text = "B-Spline";
      break;
    default:
      this.#pathText.text = PathType[type];
      break;
    }


    this.#pathText.position = this.playfield.toSpaceOfOtherDrawable(this.hitObject.stackedPosition.add(position), this).add(new Vec2(5, -5));
    this.#pathText.fadeOutFromOne(750);
    this.#pathText.accentColor = SliderPathVisualizer.getColor(type);
  }
}

class PathText extends CompositeDrawable
{
  readonly #text: SpriteText;
  readonly #background: Box;

  constructor()
  {
    super();

    this.origin = Anchor.BottomLeft;
    this.autoSizeAxes = Axes.Both;
    this.masking = true;
    this.cornerRadius = 3;
    this.alpha = 0;

    this.internalChildren = [
      this.#background = new Box({
        relativeSizeAxes: Axes.Both,
      }),
      this.#text = new SpriteText({
        margin: 3,
        style: {
          fill: 0xffffff,
          fontSize: 14,
        },
      }),
    ];
  }

  get text()
  {
    return this.#text.text;
  }

  set text(value)
  {
    this.#text.text = value;
  }

  set accentColor(value: ColorSource)
  {
    this.#background.color = value;
  }
}

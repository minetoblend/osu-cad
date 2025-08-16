import { almostEquals, Axes, Cached, CompositeDrawable, Container, dependencyLoader, resolved } from "@osucad/framework";
import { ComposeTimeline } from "./ComposeTimeline";
import { PointVisualization } from "./PointVisualization";
import { EditorBeatmap } from "../../runtime";
import { BindableBeatDivisor } from "../../BindableBeatDivisor";
import { EditorClock } from "../../EditorClock";

const TICK_WIDTH = 2;

export class TimelineTickDisplay extends Container<PointVisualization>
{
  constructor()
  {
    super();

    this.relativeSizeAxes = Axes.Both;
  }

  readonly #tickCache = new Cached();

  #invalidateTicks()
  {
    this.#tickCache.invalidate();
  }

  #visibleRange = new Range(
      -Number.MAX_VALUE,
      Number.MAX_VALUE,
  );

  @resolved(() => ComposeTimeline)
  accessor #timeline!: ComposeTimeline

  @resolved(EditorBeatmap)
  accessor #beatmap!: EditorBeatmap;

  @resolved(EditorClock)
  accessor #editorClock!: EditorClock;

  @resolved(BindableBeatDivisor)
  accessor #beatDivisor!: BindableBeatDivisor

  override update()
  {
    super.update();

    const newRange = new Range(this.#timeline.startTime, this.#timeline.endTime);
    if (!this.#visibleRange.equals(newRange))
    {
      this.#visibleRange = newRange;
      this.#invalidateTicks();
    }

    if (!this.#tickCache.isValid)
      this.#createTicks();
  }

  #createTicks()
  {
    let drawableIndex = 0;

    const getNextUsableLine = () =>
    {
      let point: PointVisualization;

      if (drawableIndex >= this.children.length)
      {
        this.add(point = this.createPointVisualization());
      }
      else
      {
        point = this.children[drawableIndex];
      }

      drawableIndex++;

      return point;
    };

    const timingPoints = this.#beatmap.controlPointInfo.timingPoints;
    const range = this.#visibleRange;

    const beatDivisor = this.#beatDivisor.value;

    for (let i = 0; i < timingPoints.length; i++)
    {
      const point = timingPoints.get(i)!;
      const next = timingPoints.get(i + 1);
      const until = next?.time ??  this.#editorClock.trackLength;

      const step = point.beatLength / beatDivisor;

      if (next && next.time < range.min)
        continue;
      if (point.time > range.max)
        break;

      let beat = 0;

      for (let t = point.time; t < until; t += step)
      {
        const xPos = (t - range.min) / (range.max - range.min);

        const divisor = BindableBeatDivisor.getDivisorForBeatIndex(beat, beatDivisor);
        const color = 0xffffff;

        const size = BindableBeatDivisor.getSize(divisor);

        const line = getNextUsableLine();
        line.x = xPos;
        line.width = TICK_WIDTH * size.x;
        line.height = size.y;
        line.color = color;

        beat++;

        if (t > range.max)
          break;
      }
    }

    const usedDrawables = drawableIndex;

    while (drawableIndex < Math.min(usedDrawables + 16, this.children.length))
      this.children[drawableIndex++].alpha = 0;

    while (drawableIndex < this.children.length)
      this.children[drawableIndex++].expire();

    this.#tickCache.validate();

  }

  protected createPointVisualization()
  {
    return new PointVisualization();
  }
}

class Range
{
  constructor(
    readonly min: number,
    readonly max: number,
  )
  {
  }

  equals(other: Range)
  {
    return almostEquals(this.min, other.min) && almostEquals(this.max, other.max);
  }
}

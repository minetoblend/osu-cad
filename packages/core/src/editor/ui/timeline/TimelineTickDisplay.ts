import type { DrawableOptions, ReadonlyDependencyContainer } from '@osucad/framework';
import type { ColorSource } from 'pixi.js';
import { almostEquals, Axes, Cached, resolved, Vec2 } from '@osucad/framework';
import { UpdateHandler } from '@osucad/multiplayer';
import { ControlPointInfo } from '../../../controlPoints/ControlPointInfo';
import { BindableBeatDivisor } from '../../BindableBeatDivisor';
import { PointVisualization } from './PointVisualization';
import { Timeline } from './Timeline';
import { TimelinePart } from './TimelinePart';

const TICK_WIDTH = 2;

export class TimelineTickDisplay extends TimelinePart<PointVisualization> {
  constructor(options: DrawableOptions = {}) {
    super();

    this.with({
      relativeSizeAxes: Axes.Both,
      ...options,
    });
  }

  readonly beatDivisor = new BindableBeatDivisor();

  readonly #tickCache = new Cached();

  #invalidateTicks() {
    this.#tickCache.invalidate();
  }

  #visibleRange = new Range(
    -Number.MAX_VALUE,
    Number.MAX_VALUE,
  );

  #nextMinTick: number | null = null;

  #nextMaxTick: number | null = null;

  @resolved(Timeline, true)
  protected timeline?: Timeline;

  @resolved(ControlPointInfo)
  protected controlPoints!: ControlPointInfo;

  @resolved(UpdateHandler)
  protected updateHandler!: UpdateHandler;

  protected override load(dependencies: ReadonlyDependencyContainer) {
    super.load(dependencies);

    this.beatDivisor.addOnChangeListener(() => this.#invalidateTicks());

    this.beatDivisor.bindTo(this.editorClock.beatSnapDivisor);

    this.updateHandler.commandApplied.addListener(this.#invalidateTicks, this);

    this.controlPoints.anyPointChanged.addListener(this.#invalidateTicks, this);
  }

  override update() {
    super.update();

    if (!this.timeline || this.drawWidth <= 0)
      return;

    const quad = this.timeline.screenSpaceDrawQuad;

    const newRange = new Range(
      (this.toLocalSpace(quad.topLeft).x - PointVisualization.MAX_WIDTH * 2) / this.drawWidth * this.content.relativeChildSize.x,
      (this.toLocalSpace(quad.topRight).x + PointVisualization.MAX_WIDTH * 2) / this.drawWidth * this.content.relativeChildSize.x,
    );

    if (!this.#visibleRange.equals(newRange)) {
      this.#visibleRange = newRange;

      if (this.#nextMinTick === null || this.#nextMaxTick === null || (this.#visibleRange.min < this.#nextMinTick || this.#visibleRange.max > this.#nextMaxTick))
        this.#tickCache.invalidate();
    }

    if (!this.#tickCache.isValid)
      this.#createTicks();
  }

  #createTicks() {
    let drawableIndex = 0;

    const getNextUsableLine = () => {
      let point: PointVisualization;

      if (drawableIndex >= this.children.length) {
        this.add(point = this.createPointVisualization());
      }
      else {
        point = this.children[drawableIndex];
      }

      drawableIndex++;

      return point;
    };

    this.#nextMinTick = null;
    this.#nextMaxTick = null;

    for (let i = 0; i < this.controlPoints.timingPoints.length; i++) {
      const point = this.controlPoints.timingPoints.get(i)!;
      const until = this.controlPoints.timingPoints.get(i + 1)?.time ?? this.editorClock.trackLength;

      let beat = 0;

      for (let t = point.time; t < until; t += point.beatLength / this.beatDivisor.value) {
        const xPos = t;

        if (t < this.#visibleRange.min) {
          this.#nextMinTick = xPos;
        }
        else if (t > this.#visibleRange.max) {
          this.#nextMaxTick ??= xPos;
        }
        else {
          if (beat === 0 && i === 0)
            this.#nextMinTick = -Number.MAX_VALUE;

          const indexInBar = beat % (point.meter * this.beatDivisor.value);

          const divisor = BindableBeatDivisor.getDivisorForBeatIndex(beat, this.beatDivisor.value);
          const color = this.getColor(divisor);

          const size = this.getSize(divisor, indexInBar);

          const line = getNextUsableLine();
          line.x = xPos;
          line.width = TICK_WIDTH * size.x;
          line.height = size.y;
          line.color = color;
          line.alpha = this.getAlpha(divisor);
        }

        beat++;
      }
    }

    const usedDrawables = drawableIndex;

    while (drawableIndex < Math.min(usedDrawables + 16, this.children.length))
      this.children[drawableIndex++].alpha = 0;

    while (drawableIndex < this.children.length)
      this.children[drawableIndex++].expire();

    this.#tickCache.validate();
  }

  protected getColor(divisor: number): ColorSource {
    return BindableBeatDivisor.getColorFor(divisor);
  }

  protected getSize(divisor: number, indexInBar: number) {
    return indexInBar === 0
      ? new Vec2(1.3, 1)
      : BindableBeatDivisor.getSize(divisor);
  }

  protected getAlpha(divisor: number) {
    return 1;
  }

  protected createPointVisualization() {
    return new PointVisualization();
  }

  override dispose(isDisposing: boolean = true) {
    super.dispose(isDisposing);

    this.updateHandler.commandApplied.removeListener(this.#invalidateTicks, this);

    this.controlPoints.anyPointChanged.removeListener(this.#invalidateTicks, this);
  }
}

class Range {
  constructor(
    readonly min: number,
    readonly max: number,
  ) {
  }

  equals(other: Range) {
    return almostEquals(this.min, other.min) && almostEquals(this.max, other.max);
  }
}

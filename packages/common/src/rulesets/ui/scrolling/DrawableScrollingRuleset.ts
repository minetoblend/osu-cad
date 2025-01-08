import type { ReadonlyDependencyContainer } from 'osucad-framework';
import type { IBeatmap } from '../../../beatmap/IBeatmap';
import type { HitObject } from '../../../hitObjects/HitObject';
import type { Ruleset } from '../../Ruleset';
import type { IScrollAlgorithm } from './algorithms/IScrollAlgorithm';
import { Bindable, BindableNumber, EasingFunction, provide, SortedList } from 'osucad-framework';
import { ControlPoint } from '../../../controlPoints/ControlPoint';
import { EffectPoint } from '../../../controlPoints/EffectPoint';
import { TimingPoint } from '../../../controlPoints/TimingPoint';
import { DrawableRuleset } from '../../DrawableRuleset';
import { MultiplierControlPoint } from '../../timing/MultiplierControlPoint';
import { ConstantScrollAlgorithm } from './algorithms/ConstantScrollAlgorithm';
import { OverlappingScrollAlgorithm } from './algorithms/OverlappingScrollAlgorithm';
import { SequentialScrollAlgorithm } from './algorithms/SequentialScrollAlgorithm';
import { IDrawableScrollingRuleset } from './IDrawableScrollingRuleset';
import { IScrollingInfo } from './IScrollingInfo';
import { ScrollingDirection } from './ScrollingDirection';
import { ScrollingPlayfield } from './ScrollingPlayfield';
import { ScrollVisualisationMethod } from './ScrollVisualisationMethod';

const time_span_default = 1500;

const time_span_min = 50;

const time_span_max = 20000;

const time_span_step = 200;

@provide(IDrawableScrollingRuleset)
export abstract class DrawableScrollingRuleset<T extends HitObject> extends DrawableRuleset<T> implements IDrawableScrollingRuleset {
  protected readonly direction = new Bindable<ScrollingDirection>(ScrollingDirection.Up);

  protected readonly timeRange = new BindableNumber(time_span_default)
    .withMinValue(time_span_min)
    .withMaxValue(time_span_max);

  protected get userScrollSpeedAdjustment() {
    return this.timeRange.value / time_span_step;
  }

  protected get relativeScaleBeatLengths() {
    return false;
  }

  protected readonly controlPoints = new SortedList<MultiplierControlPoint>(MultiplierControlPoint.Comparer);

  @provide(IScrollingInfo)
  get scrollingInfo(): IScrollingInfo {
    return this.#scrollingInfo;
  }

  readonly #scrollingInfo: LocalScrollingInfo;

  constructor(ruleset: Ruleset, beatmap: IBeatmap) {
    super(ruleset, beatmap);

    this.#scrollingInfo = new LocalScrollingInfo();
    this.#scrollingInfo.direction.bindTo(this.direction);
    this.#scrollingInfo.timeRange.bindTo(this.timeRange);
  }

  protected override load(dependencies: ReadonlyDependencyContainer) {
    super.load(dependencies);

    this.#updateScrollAlgorithm();

    const lastObjectTime = this.beatmap.hitObjects.last?.endTime ?? 0;
    const baseBeatLength = TimingPoint.DEFAULT_BEAT_LENGTH;

    if (this.relativeScaleBeatLengths) {
      // TODO
      // baseBeatLength = Beatmap.GetMostCommonBeatLength();
      //
      // // The slider multiplier is post-multiplied to determine the final velocity, but for relative scale beat lengths
      // // the multiplier should not affect the effective timing point (the longest in the beatmap), so it is factored out here
      // baseBeatLength /= Beatmap.Difficulty.SliderMultiplier;
    }

    let lastTimingPoint = new TimingPoint();
    let lastEffectPoint = new EffectPoint();
    const allPoints = new SortedList<ControlPoint>(ControlPoint.COMPARER);

    allPoints.addRange(this.beatmap.controlPoints.timingPoints.items);
    allPoints.addRange(this.beatmap.controlPoints.effectPoints.items);

    let timingChanges = allPoints.items.map((c) => {
      if (c instanceof TimingPoint)
        lastTimingPoint = c;
      if (c instanceof EffectPoint)
        lastEffectPoint = c;

      const multiplierPoint = new MultiplierControlPoint(c.time);

      multiplierPoint.velocity = this.beatmap.difficulty.sliderMultiplier;
      multiplierPoint.baseBeatLength = baseBeatLength;
      multiplierPoint.timingPoint = lastTimingPoint;
      multiplierPoint.effectPoint = lastEffectPoint;

      return multiplierPoint;
    });

    timingChanges = timingChanges.filter(it => it.time <= lastObjectTime);

    let lastTime = -Number.MAX_VALUE;

    const deduplicated: MultiplierControlPoint[] = [];
    for (const point of [...timingChanges]) {
      if (point.time === lastTime)
        deduplicated[deduplicated.length - 1] = point;
      else
        deduplicated.push(point);

      lastTime = point.time;
    }

    timingChanges = deduplicated.toSorted((a, b) => a.time - b.time);

    this.controlPoints.addRange(timingChanges);

    if (this.controlPoints.length === 0) {
      const point = new MultiplierControlPoint();
      point.velocity = this.beatmap.difficulty.sliderMultiplier;

      this.controlPoints.add(point);
    }
  }

  protected override loadComplete() {
    super.loadComplete();

    if (!(this.playfield instanceof ScrollingPlayfield))
      throw new Error('Playfield must be a ScrollingPlayfield');
  }

  #visualisationMethod = ScrollVisualisationMethod.Sequential;

  get visualisationMethod() {
    return this.#visualisationMethod;
  }

  set visualisationMethod(value: ScrollVisualisationMethod) {
    this.#visualisationMethod = value;
    this.#updateScrollAlgorithm();
  }

  #updateScrollAlgorithm() {
    switch (this.visualisationMethod) {
      case ScrollVisualisationMethod.Sequential:
        this.#scrollingInfo.algorithm.value = new SequentialScrollAlgorithm(this.controlPoints);
        break;

      case ScrollVisualisationMethod.Overlapping:
        this.#scrollingInfo.algorithm.value = new OverlappingScrollAlgorithm(this.controlPoints);
        break;

      case ScrollVisualisationMethod.Constant:
        this.#scrollingInfo.algorithm.value = new ConstantScrollAlgorithm();
        break;
    }
  }

  protected adjustScrollSpeed(amount: number) {
    this.transformBindableTo(this.timeRange, this.timeRange.value - amount * time_span_step, 200, EasingFunction.OutQuint);
  }
}

class LocalScrollingInfo implements IScrollingInfo {
  readonly direction = new Bindable<ScrollingDirection>(ScrollingDirection.Up);
  readonly timeRange = new Bindable<number>(0);
  readonly algorithm = new Bindable<IScrollAlgorithm>(new ConstantScrollAlgorithm());
}

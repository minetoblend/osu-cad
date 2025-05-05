import type { BeatmapDifficultyInfo, IBeatmapTiming } from "@osucad/core";
import { safeAssign } from "@osucad/core";
import { BindableNumber, Vec2 } from "@osucad/framework";
import { HitCircle } from "./HitCircle";
import type { OsuHitObjectOptions } from "./OsuHitObject";
import { OsuHitObject } from "./OsuHitObject";
import type { PathPoint } from "./PathPoint";
import { SliderPath } from "./SliderPath";

export interface SliderOptions extends OsuHitObjectOptions
{
  repeatCount?: number
  expectedDistance?: number
  controlPoints?: readonly PathPoint[]
}

export class Slider extends OsuHitObject
{
  constructor(options: SliderOptions = {})
  {
    const { repeatCount, expectedDistance, controlPoints, ...rest } = options;
    super(rest);

    safeAssign(this, { repeatCount });

    safeAssign(this.path, { expectedDistance, controlPoints });

    this.headCircle.startTimeBindable.bindTo(this.startTimeBindable);
    this.headCircle.indexInComboBindable.bindTo(this.indexInComboBindable);
    this.headCircle.comboIndexBindable.bindTo(this.comboIndexBindable);
    this.headCircle.stackHeightBindable.bindTo(this.stackHeightBindable);
    this.headCircle.scaleBindable.bindTo(this.scaleBindable);

    this.positionBindable.bindValueChanged(this.#updateNestedPositions, this);
  }

  #updateNestedPositions()
  {
    this.headCircle.position = this.position;
  }

  readonly headCircle = new HitCircle();

  readonly repeatCountBindable = new BindableNumber(0)
    .withMinValue(0)
    .withPrecision(1);


  get repeatCount()
  {
    return this.repeatCountBindable.value;
  }

  set repeatCount(value)
  {
    this.repeatCountBindable.value = value;
  }

  spanCount()
  {
    return this.repeatCount + 1;
  }

  readonly sliderVelocityBindable = new BindableNumber(1)
    .withMinValue(0);

  get sliderVelocity()
  {
    return this.sliderVelocityBindable.value;
  }

  private set sliderVelocity(value: number)
  {
    this.sliderVelocityBindable.value = value;
  }

  spanDuration()
  {
    return this.path.actualDistance / this.sliderVelocity;
  }

  public override get duration(): number
  {
    return this.spanDuration() * this.spanCount();
  }

  #tickDistance = 1;

  get tickDistance()
  {
    return this.#tickDistance;
  }

  public override applyDefaults(difficulty: BeatmapDifficultyInfo, timing: IBeatmapTiming)
  {
    super.applyDefaults(difficulty, timing);

    const timingPoint = timing.getTimingInfoAt(this.startTime + 1);

    const baseVelocity = Slider.BASE_SCORING_DISTANCE * difficulty.sliderMultiplier / timingPoint.beatLength;

    const sliderVelocity = timing.getSliderVelocityAt(this.startTime + 1);

    this.sliderVelocity = baseVelocity * sliderVelocity;

    const scoringDistance = this.sliderVelocity * timingPoint.beatLength;

    this.#tickDistance = scoringDistance / difficulty.sliderTickRate;
  }

  readonly path = new SliderPath();

  spanAt(progress: number)
  {
    return Math.floor(progress * this.spanCount());
  }

  progressAt(progress: number): number
  {
    let p = (progress * this.spanCount()) % 1;
    if (this.spanAt(progress) % 2 === 1)
      p = 1 - p;
    return p;
  }

  curvePositionAt(progress: number, out: Vec2 = new Vec2()): Vec2
  {
    return this.path.getPositionAt(this.progressAt(progress), out);
  }

  public override get endPosition(): Vec2
  {
    return this.position.add(this.curvePositionAt(1));
  }
}

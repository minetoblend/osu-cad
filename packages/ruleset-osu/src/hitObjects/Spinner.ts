import type { ControlPointInfo, HitSampleInfo, Judgement } from "@osucad/core";
import { BeatmapDifficultyInfo, bindableBacked, HitWindows, safeAssign } from "@osucad/core";
import { BindableNumber, Vec2 } from "@osucad/framework";
import { type, type DDSAttributes } from "@osucad/multiplayer-core";
import { OsuJudgement } from "../judgements/OsuJudgement";
import type { OsuHitObjectOptions } from "./OsuHitObject";
import { OsuHitObject } from "./OsuHitObject";
import { SpinnerBonusTick } from "./SpinnerBonusTick";
import { SpinnerTick } from "./SpinnerTick" with {  };

const zero_vector = Vec2.zero();

const bonus_spins_gap = 2;
const clear_rpm_range = {
  min: 90,
  mid: 150,
  max: 225,
};
const complete_rpm_range = {
  min: 250,
  mid: 380,
  max: 430,
};

export interface SpinnerOptions extends OsuHitObjectOptions
{
  duration?: number
}

export class Spinner extends OsuHitObject
{
  static readonly attributes: DDSAttributes = {
    type: "@osucad/spinner",
    version: 0,
  };

  constructor(options: SpinnerOptions = {})
  {
    const { duration, ...rest } = options;

    super(Spinner.attributes, rest);

    safeAssign(this, { duration });
  }

  readonly durationBindable = new BindableNumber(0)
    .withMinValue(0);

  @type("float64")
  @bindableBacked("durationBindable")
  override accessor duration!: number

  override get endTime()
  {
    return this.startTime + this.duration;
  }

  override set endTime(value: number)
  {
    this.duration = value - this.startTime;
  }

  #spinsRequired = 1;

  public get spinsRequired(): number
  {
    return this.#spinsRequired;
  }

  protected set spinsRequired(value: number)
  {
    this.#spinsRequired = value;
  }

  get spinsRequiredForBonus()
  {
    return this.spinsRequired + bonus_spins_gap;
  }

  #maximumBonusSpins = 1;

  public get maximumBonusSpins(): number
  {
    return this.#maximumBonusSpins;
  }

  protected set maximumBonusSpins(value: number)
  {
    this.#maximumBonusSpins = value;
  }

  override get stackOffset()
  {
    return zero_vector;
  }

  protected override applyDefaultsToSelf(difficulty: BeatmapDifficultyInfo, controlPoints: ControlPointInfo)
  {
    super.applyDefaultsToSelf(difficulty, controlPoints);

    const minRps = BeatmapDifficultyInfo.difficultyRange(difficulty.overallDifficulty, clear_rpm_range.min, clear_rpm_range.mid, clear_rpm_range.max) / 60;

    const maxRps = BeatmapDifficultyInfo.difficultyRange(difficulty.overallDifficulty, complete_rpm_range.min, complete_rpm_range.mid, complete_rpm_range.max) / 60;

    const secondsDuration = this.duration / 1000;

    const duration_error = 0.0001;

    this.spinsRequired = Math.floor(minRps * secondsDuration + duration_error);
    this.maximumBonusSpins = Math.max(0, Math.floor(maxRps * secondsDuration + duration_error) - this.spinsRequired - bonus_spins_gap);
  }

  protected override createNestedHitObjects()
  {
    super.createNestedHitObjects();

    const totalSpins = this.maximumBonusSpins + this.spinsRequired + bonus_spins_gap;

    for (let i = 0; i < totalSpins; i++)
    {
      const startTime = this.startTime + (i + 1) / totalSpins * this.duration;

      const nested = i < this.spinsRequiredForBonus
          ? new SpinnerTick()
          : new SpinnerBonusTick();

      nested.startTime = startTime;
      nested.spinnerDuration = this.duration;

      this.addNested(nested);
    }
  }

  override createJudgement(): Judgement
  {
    return new OsuJudgement();
  }

  protected override createHitWindows()
  {
    return HitWindows.Empty;
  }

  createSpinningSamples(): HitSampleInfo[]
  {
    const referenceSample = this.samples[0];
    if (!referenceSample)
      return [];

    return [referenceSample.with("spinnerspin")];
  }

  protected override isSpinner(): this is Spinner
  {
    return true;
  }

  override getSnapTargets(): Vec2[]
  {
    return [];
  }
}

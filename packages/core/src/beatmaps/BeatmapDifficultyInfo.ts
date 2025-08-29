import { BindableNumber } from "@osucad/framework";
import type { DDSAttributes } from "@osucad/multiplayer-core";
import { ObjectDDS, type } from "@osucad/multiplayer-core";
import { bindableBacked } from "../utils/bindableBacked";

export class BeatmapDifficultyInfo extends ObjectDDS
{
  public static readonly attributes: DDSAttributes = {
    type: "@osucad/beatmap-difficulty-info",
    version: 0,
  };

  public constructor()
  {
    super(BeatmapDifficultyInfo.attributes);
  }

  public readonly drainRateBindable = new BindableNumber(5)
    .withMinValue(0)
    .withMaxValue(10)
    .withPrecision(0.1);

  @type("float32")
  @bindableBacked("drainRateBindable")
  public accessor drainRate!: number


  public readonly circleSizeBindable = new BindableNumber(5)
    .withMinValue(0)
    .withMaxValue(10)
    .withPrecision(0.1);

  @type("float32")
  @bindableBacked("circleSizeBindable")
  public accessor circleSize!: number


  public readonly approachRateBindable = new BindableNumber(5)
    .withMinValue(0)
    .withMaxValue(10)
    .withPrecision(0.1);

  @type("float32")
  @bindableBacked("approachRateBindable")
  public accessor approachRate!: number

  public readonly overallDifficultyBindable = new BindableNumber(5)
    .withMinValue(0)
    .withMaxValue(10)
    .withPrecision(0.1);

  @type("float32")
  @bindableBacked("overallDifficultyBindable")
  public accessor overallDifficulty!: number

  public readonly sliderMultiplierBindable = new BindableNumber(1.4)
    .withMinValue(0.4)
    .withMaxValue(3.6)
    .withPrecision(0.1);

  @type("float32")
  @bindableBacked("sliderMultiplierBindable")
  public accessor sliderMultiplier!: number

  public readonly sliderTickRateBindable = new BindableNumber(1)
    .withMinValue(1)
    .withMaxValue(4)
    .withPrecision(1);

  @type("int8")
  @bindableBacked("sliderTickRateBindable")
  public accessor sliderTickRate!: number

  public static difficultyRange(difficulty: number, min: number, mid: number, max: number)
  {
    if (difficulty > 5)
      return mid + (max - mid) * (difficulty - 5) / 5;
    else if (difficulty < 5)
      return mid + (mid - min) * (difficulty - 5) / 5;

    return mid;
  }

  public calculateCircleSize(applyFudge: boolean)
  {
    const broken_gamefield_rounding_allowance = 1.00041;

    return (1.0 - 0.7 * BeatmapDifficultyInfo.difficultyRange(this.circleSize, -1, 0, 1)) / 2 * (applyFudge ? broken_gamefield_rounding_allowance : 1);
  }
}

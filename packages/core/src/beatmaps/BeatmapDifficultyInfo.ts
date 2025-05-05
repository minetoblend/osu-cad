import { BindableNumber } from "@osucad/framework";

export class BeatmapDifficultyInfo 
{
  readonly drainRateBindable = new BindableNumber(5)
    .withMinValue(0)
    .withMaxValue(10)
    .withPrecision(0.1);

  get drainRate() 
  {
    return this.drainRateBindable.value;
  }

  set drainRate(value) 
  {
    this.drainRateBindable.value = value;
  }

  readonly circleSizeBindable = new BindableNumber(5)
    .withMinValue(0)
    .withMaxValue(10)
    .withPrecision(0.1);

  get circleSize() 
  {
    return this.circleSizeBindable.value;
  }

  set circleSize(value) 
  {
    this.circleSizeBindable.value = value;
  }


  readonly approachRateBindable = new BindableNumber(5)
    .withMinValue(0)
    .withMaxValue(10)
    .withPrecision(0.1);

  get approachRate() 
  {
    return this.approachRateBindable.value;
  }

  set approachRate(value) 
  {
    this.approachRateBindable.value = value;
  }

  readonly overallDifficultyBindable = new BindableNumber(5)
    .withMinValue(0)
    .withMaxValue(10)
    .withPrecision(0.1);

  get overallDifficulty() 
  {
    return this.overallDifficultyBindable.value;
  }

  set overallDifficulty(value) 
  {
    this.overallDifficultyBindable.value = value;
  }

  readonly sliderMultiplierBindable = new BindableNumber(1.4)
    .withMinValue(0.4)
    .withMaxValue(3.6)
    .withPrecision(0.1);

  get sliderMultiplier() 
  {
    return this.sliderMultiplierBindable.value;
  }

  set sliderMultiplier(value) 
  {
    this.sliderMultiplierBindable.value = value;
  }

  readonly sliderTickRateBindable = new BindableNumber(1)
    .withMinValue(1)
    .withMaxValue(4)
    .withPrecision(1);

  get sliderTickRate() 
  {
    return this.sliderTickRateBindable.value;
  }

  set sliderTickRate(value) 
  {
    this.sliderTickRateBindable.value = value;
  }

  static difficultyRange(difficulty: number, min: number, mid: number, max: number) 
  {
    if (difficulty > 5)
      return mid + (max - mid) * (difficulty - 5) / 5;
    else if (difficulty < 5)
      return mid + (mid - min) * (difficulty - 5) / 5;

    return mid;
  }

  calculateCircleSize(applyFudge: boolean) 
  {
    const broken_gamefield_rounding_allowance = 1.00041;

    return (1.0 - 0.7 * BeatmapDifficultyInfo.difficultyRange(this.circleSize, -1, 0, 1)) / 2 * (applyFudge ? broken_gamefield_rounding_allowance : 1);
  }
}

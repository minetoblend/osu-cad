import type { IDeepCloneable } from '../utils/IDeepCloneable';
import { BindableNumber } from 'osucad-framework';
import { ObjectCrdt } from '../crdt/ObjectCrdt';

export class BeatmapDifficultyInfo extends ObjectCrdt implements IDeepCloneable<BeatmapDifficultyInfo> {
  constructor() {
    super();
  }

  readonly #hpDrainRate = this.property('hpDrainRate', Object.assign(new BindableNumber(5), {
    minValue: 0,
    maxValue: 10,
    precision: 0.1,
  }));

  get hpDrainRateBindable() {
    return this.#hpDrainRate.bindable;
  }

  get hpDrainRate() {
    return this.#hpDrainRate.value;
  }

  set hpDrainRate(value) {
    this.#hpDrainRate.value = value;
  }

  readonly #circleSize = this.property('circleSize', Object.assign(new BindableNumber(5), {
    minValue: 0,
    maxValue: 10,
    precision: 0.1,
  }));

  get circleSizeBindable() {
    return this.#circleSize.bindable;
  }

  get circleSize() {
    return this.#circleSize.value;
  }

  set circleSize(value) {
    this.#circleSize.value = value;
  }

  readonly #approachRate = this.property('approachRate', Object.assign(new BindableNumber(5), {
    minValue: 0,
    maxValue: 10,
    precision: 0.1,
  }));

  get approachRateBindable() {
    return this.#approachRate.bindable;
  }

  get approachRate() {
    return this.#approachRate.value;
  }

  set approachRate(value) {
    this.#approachRate.value = value;
  }

  readonly #overallDifficulty = this.property('overallDifficulty', Object.assign(new BindableNumber(5), {
    minValue: 0,
    maxValue: 10,
    precision: 0.1,
  }));

  get overallDifficultyBindable() {
    return this.#overallDifficulty.bindable;
  }

  get overallDifficulty() {
    return this.#overallDifficulty.value;
  }

  set overallDifficulty(value) {
    this.#overallDifficulty.value = value;
  }

  readonly #sliderMultiplier = this.property('sliderMultiplier', Object.assign(new BindableNumber(1.4), {
    minValue: 0.4,
    maxValue: 3.6,
    precision: 0.1,
  }));

  get sliderMultiplierBindable() {
    return this.#sliderMultiplier.bindable;
  }

  get sliderMultiplier() {
    return this.#sliderMultiplier.value;
  }

  set sliderMultiplier(value) {
    this.#sliderMultiplier.value = value;
  }

  readonly #sliderTickRate = this.property('sliderTickRate', Object.assign(new BindableNumber(1.4), {
    minValue: 1,
    maxValue: 4,
    precision: 1,
  }));

  get sliderTickRateBindable() {
    return this.#sliderTickRate.bindable;
  }

  get sliderTickRate() {
    return this.#sliderTickRate.value;
  }

  set sliderTickRate(value) {
    this.#sliderTickRate.value = value;
  }

  static difficultyRange(difficulty: number, min: number, mid: number, max: number) {
    if (difficulty > 5)
      return mid + (max - mid) * (difficulty - 5) / 5;
    else if (difficulty < 5)
      return mid + (mid - min) * (difficulty - 5) / 5;

    return mid;
  }

  calculateCircleSize(applyFudge: boolean) {
    const broken_gamefield_rounding_allowance = 1.00041;

    return (1.0 - 0.7 * BeatmapDifficultyInfo.difficultyRange(this.circleSize, -1, 0, 1)) / 2 * (applyFudge ? broken_gamefield_rounding_allowance : 1);
  }

  deepClone(): BeatmapDifficultyInfo {
    const {
      hpDrainRate,
      circleSize,
      approachRate,
      overallDifficulty,
      sliderMultiplier,
      sliderTickRate,
    } = this;

    return Object.assign(new BeatmapDifficultyInfo(), {
      hpDrainRate,
      circleSize,
      approachRate,
      overallDifficulty,
      sliderMultiplier,
      sliderTickRate,
    });
  }
}

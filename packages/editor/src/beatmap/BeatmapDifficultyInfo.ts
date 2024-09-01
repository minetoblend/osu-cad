import { Action } from 'osucad-framework';

export class BeatmapDifficultyInfo implements PlainBeatmapDifficultyInfo {
  get hpDrainRate() {
    return this.#hpDrainRate;
  }

  set hpDrainRate(value) {
    if (value === this.#hpDrainRate)
      return;

    this.#hpDrainRate = value;

    this.onUpdate.emit('hpDrainRate');
  }

  get circleSize() {
    return this.#circleSize;
  }

  set circleSize(value) {
    if (value === this.#circleSize)
      return;

    this.#circleSize = value;

    this.onUpdate.emit('circleSize');
  }

  get approachRate() {
    return this.#approachRate;
  }

  set approachRate(value) {
    if (value === this.#approachRate)
      return;

    this.#approachRate = value;

    this.onUpdate.emit('approachRate');
  }

  get overallDifficulty() {
    return this.#overallDifficulty;
  }

  set overallDifficulty(value) {
    if (value === this.#overallDifficulty)
      return;

    this.#overallDifficulty = value;

    this.onUpdate.emit('overallDifficulty');
  }

  get sliderMultiplier() {
    return this.#sliderMultiplier;
  }

  set sliderMultiplier(value) {
    if (value === this.#sliderMultiplier)
      return;

    this.#sliderMultiplier = value;

    this.onUpdate.emit('sliderMultiplier');
  }

  get sliderTickRate() {
    return this.#sliderTickRate;
  }

  set sliderTickRate(value) {
    if (value === this.#sliderTickRate)
      return;

    this.#sliderTickRate = value;

    this.onUpdate.emit('sliderTickRate');
  }

  #hpDrainRate = 5;

  #circleSize = 4;

  #approachRate = 9;

  #overallDifficulty = 8;

  #sliderMultiplier = 1.4;

  #sliderTickRate = 1;

  assignFrom(data: PlainBeatmapDifficultyInfo) {
    this.hpDrainRate = data.hpDrainRate;
    this.circleSize = data.circleSize;
    this.approachRate = data.approachRate;
    this.overallDifficulty = data.overallDifficulty;
    this.sliderMultiplier = data.sliderMultiplier;
    this.sliderTickRate = data.sliderTickRate;
  }

  toPlain(): PlainBeatmapDifficultyInfo {
    const {
      hpDrainRate,
      circleSize,
      approachRate,
      overallDifficulty,
      sliderMultiplier,
      sliderTickRate,
    } = this;

    return {
      hpDrainRate,
      circleSize,
      approachRate,
      overallDifficulty,
      sliderMultiplier,
      sliderTickRate,
    };
  }

  onUpdate = new Action<keyof PlainBeatmapDifficultyInfo>();

  difficultyRange(difficulty: number, min: number, mid: number, max: number) {
    if (difficulty > 5)
      return mid + (max - mid) * (difficulty - 5) / 5;
    else if (difficulty < 5)
      return mid + (mid - min) * (difficulty - 5) / 5;

    return mid;
  }

  calculateCircleSize(applyFudge: boolean) {
    const broken_gamefield_rounding_allowance = 1.00041;

    return (1.0 - 0.7 * this.difficultyRange(this.circleSize, -1, 0, 1)) / 2 * (applyFudge ? broken_gamefield_rounding_allowance : 1);
  }
}

export interface PlainBeatmapDifficultyInfo {
  hpDrainRate: number;
  circleSize: number;
  approachRate: number;
  overallDifficulty: number;
  sliderMultiplier: number;
  sliderTickRate: number;

}

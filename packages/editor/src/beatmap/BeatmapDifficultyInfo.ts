import type { CommandContext } from '../editor/commands/CommandContext.ts';
import type { Patchable } from '../editor/commands/Patchable.ts';
import { Action, Bindable, BindableNumber } from 'osucad-framework';
import { PatchUtils } from '../editor/commands/PatchUtils.ts';

export interface BeatmapDifficultyPatch {
  hpDrainRate: number;
  circleSize: number;
  approachRate: number;
  overallDifficulty: number;
  sliderMultiplier: number;
  sliderTickRate: number;
}

export class BeatmapDifficultyInfo implements PlainBeatmapDifficultyInfo, Patchable<BeatmapDifficultyPatch> {
  constructor() {
    for (const key in this) {
      const value = this[key];
      if (value instanceof Bindable)
        value.addOnChangeListener(() => this.invalidated.emit());
    }
  }

  hpDrainRateBindable = Object.assign(new BindableNumber(5), {
    minValue: 0,
    maxValue: 10,
    precision: 0.1,
  });

  get hpDrainRate() {
    return this.hpDrainRateBindable.value;
  }

  set hpDrainRate(value) {
    this.hpDrainRateBindable.value = value;
  }

  circleSizeBindable = Object.assign(new BindableNumber(5), {
    minValue: 0,
    maxValue: 10,
    precision: 0.1,
  });

  get circleSize() {
    return this.circleSizeBindable.value;
  }

  set circleSize(value) {
    this.circleSizeBindable.value = value;
  }

  approachRateBindable = Object.assign(new BindableNumber(5), {
    minValue: 0,
    maxValue: 10,
    precision: 0.1,
  });

  get approachRate() {
    return this.approachRateBindable.value;
  }

  set approachRate(value) {
    this.approachRateBindable.value = value;
  }

  overallDifficultyBindable = Object.assign(new BindableNumber(5), {
    minValue: 0,
    maxValue: 10,
    precision: 0.1,
  });

  get overallDifficulty() {
    return this.overallDifficultyBindable.value;
  }

  set overallDifficulty(value) {
    this.overallDifficultyBindable.value = value;
  }

  sliderMultiplierBindable = Object.assign(new BindableNumber(1.4), {
    minValue: 0.4,
    maxValue: 3.6,
    precision: 0.1,
  });

  get sliderMultiplier() {
    return this.sliderMultiplierBindable.value;
  }

  set sliderMultiplier(value) {
    this.sliderMultiplierBindable.value = value;
  }

  sliderTickRateBindable = Object.assign(new BindableNumber(1.4), {
    minValue: 1,
    maxValue: 4,
    precision: 1,
  });

  get sliderTickRate() {
    return this.sliderTickRateBindable.value;
  }

  set sliderTickRate(value) {
    this.sliderTickRateBindable.value = value;
  }

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

  invalidated = new Action();

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

  applyPatch(patch: Partial<BeatmapDifficultyPatch>, ctx: CommandContext) {
    PatchUtils.applyPatch(patch, this);
  }

  asPatch(): BeatmapDifficultyPatch {
    return this.toPlain();
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

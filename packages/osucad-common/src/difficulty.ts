import {
  IObjectAttributes,
  ITypeFactory,
  IUnisonRuntime,
  SharedMap,
} from "@osucad/unison";

export class BeatmapDifficulty extends SharedMap {
  static readonly PREEMPT_MIN = 400;

  constructor(runtime: IUnisonRuntime) {
    super(runtime, BeatmapDifficultyFactory.Attributes);
  }

  initializeFirstTime(): void {
    this.set("hpDrainRate", 5);
    this.set("circleSize", 4);
    this.set("approachRate", 8);
    this.set("overallDifficulty", 8.5);
    this.set("sliderMultiplier", 1.4);
  }

  get hpDrainRate(): number {
    return this.get("hpDrainRate") as number;
  }

  set hpDrainRate(value: number) {
    this.set("hpDrainRate", value);
  }

  get circleSize(): number {
    return this.get("circleSize") as number;
  }

  set circleSize(value: number) {
    this.set("circleSize", value);
  }

  get approachRate(): number {
    return this.get("approachRate") as number;
  }

  set approachRate(value: number) {
    this.set("approachRate", value);
  }

  get overallDifficulty(): number {
    return this.get("overallDifficulty") as number;
  }

  set overallDifficulty(value: number) {
    this.set("overallDifficulty", value);
  }

  get sliderMultiplier(): number {
    return this.get("sliderMultiplier") as number;
  }

  set sliderMultiplier(value: number) {
    this.set("sliderMultiplier", value);
  }

  static difficultyRange(
    diff: number,
    min: number,
    mid: number,
    max: number
  ): number {
    if (diff > 5) {
      return mid + ((max - mid) * (diff - 5)) / 5;
    }

    if (diff < 5) {
      return mid - ((mid - min) * (5 - diff)) / 5;
    }

    return mid;
  }

  get timePreempt(): number {
    return BeatmapDifficulty.difficultyRange(
      this.approachRate,
      1800,
      1200,
      450
    );
  }

  get timeFadeIn(): number {
    return 400 * Math.min(1, this.timePreempt / BeatmapDifficulty.PREEMPT_MIN);
  }
}

export class BeatmapDifficultyFactory
  implements ITypeFactory<BeatmapDifficulty>
{
  static readonly Type = "@osucad/betamapDifficulty";

  get type() {
    return BeatmapDifficultyFactory.Type;
  }

  static readonly Attributes: IObjectAttributes = {
    type: BeatmapDifficultyFactory.Type,
    version: "0.1",
  };

  get attributes() {
    return BeatmapDifficultyFactory.Attributes;
  }

  create(runtime: IUnisonRuntime): BeatmapDifficulty {
    return new BeatmapDifficulty(runtime);
  }
}

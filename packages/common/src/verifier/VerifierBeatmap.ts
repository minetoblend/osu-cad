import type { Beatmap } from '../beatmap/Beatmap';
import type { BeatmapColors } from '../beatmap/BeatmapColors';
import type { BeatmapDifficultyInfo } from '../beatmap/BeatmapDifficultyInfo';
import type { BeatmapInfo } from '../beatmap/BeatmapInfo';
import type { BeatmapMetadata } from '../beatmap/BeatmapMetadata';
import type { IBeatmap } from '../beatmap/IBeatmap';
import type { FileStore } from '../beatmap/io/FileStore';
import type { ControlPointInfo } from '../controlPoints/ControlPointInfo';
import type { TimingPoint } from '../controlPoints/TimingPoint';
import type { HitObject } from '../hitObjects/HitObject';
import type { Ruleset } from '../rulesets/Ruleset';
import type { Constructor } from '../utils/Constructor';
import { almostEquals } from 'osucad-framework';
import { minBy } from '../utils/arrayUtils';

export enum DifficultyType {
  Easy,
  Normal,
  Hard,
  Insane,
  Expert,
  Ultra,
}

export class VerifierBeatmap<T extends HitObject = HitObject> implements IBeatmap<T> {
  constructor(
    readonly beatmap: Beatmap<T>,
    readonly files: FileStore,
  ) {
  }

  #starRating?: number | null;

  get starRating(): number | null {
    this.calculateStarRating();
    return this.#starRating as number | null;
  }

  #ruleset: Ruleset | null = null;

  get ruleset() {
    if (this.beatmapInfo.ruleset.available)
      return this.beatmapInfo.ruleset.createInstance();

    return null;
  }

  getDifficulty(considerName = false) {
    let difficulty: DifficultyType | null = null;

    const starRating = this.starRating;

    if (starRating !== null) {
      if (starRating < 2.0)
        difficulty = DifficultyType.Easy;
      else if (starRating < 2.7)
        difficulty = DifficultyType.Normal;
      else if (starRating < 4.0)
        difficulty = DifficultyType.Hard;
      else if (starRating < 5.3)
        difficulty = DifficultyType.Insane;
      else if (starRating < 6.5)
        difficulty = DifficultyType.Expert;
      else difficulty = DifficultyType.Ultra;
    }

    if (!considerName)
      return difficulty;

    return this.getDifficultyFromName() ?? difficulty;
  }

  #nameDiffPairs: [DifficultyType, string[]][] = [
    [DifficultyType.Easy, ['Beginner', 'Easy', 'Novice']],
    [DifficultyType.Normal, ['Basic', 'Normal', 'Medium', 'Intermediate']],
    [DifficultyType.Hard, ['Advanced', 'Hard']],
    [DifficultyType.Insane, ['Hyper', 'Insane']],
    [DifficultyType.Expert, ['Expert', 'Extra', 'Extreme']],
  ];

  getDifficultyFromName() {
    const name = this.beatmapInfo.difficultyName.toLowerCase();

    const pairs = this.#nameDiffPairs.toReversed();

    for (const [type, names] of pairs) {
    // Allows difficulty names such as "Normal...!??" and ">{(__HARD;)}" to be detected,
    // but still prevents "Normality" or similar inclusions.

      if (names.some(it => new RegExp(String.raw`(^| )[!-@\\[-\`{{-~]*${it}[!-@\\[-\`{{-~]*( |$)`, 'i').test(name)))
        return type;
    }

    return null;
  }

  calculateStarRating() {
    if (this.#starRating === undefined) {
      const difficultyCalculator = this.ruleset?.createDifficultyCalculator(this.beatmap as Beatmap<any>);
      if (difficultyCalculator) {
        const [{ starRating }] = difficultyCalculator.calculate();
        this.#starRating = starRating;
      }
      else {
        this.#starRating = null;
      }
    }
  }

  get beatmapInfo(): BeatmapInfo {
    return this.beatmap.beatmapInfo;
  }

  get metadata(): BeatmapMetadata {
    return this.beatmap.metadata;
  }

  get difficulty(): BeatmapDifficultyInfo {
    return this.beatmap.difficulty;
  }

  get colors(): BeatmapColors {
    return this.beatmap.colors;
  }

  get controlPoints(): ControlPointInfo {
    return this.beatmap.controlPoints;
  }

  get hitObjects() {
    return this.beatmap.hitObjects;
  }

  hitObjectsOfType<TObject extends T>(type: Constructor<TObject>) {
    return this.beatmap.hitObjects.filter(it => it instanceof type) as TObject[];
  }

  getPracticalUnsnap(time: number, divisor?: number, timingPoint?: TimingPoint): number {
    timingPoint ??= this.controlPoints.timingPointAt(time);

    if (divisor !== undefined) {
      return time - Math.round(time - this.getTheoreticalUnsnap(time, divisor, timingPoint));
    }

    const practicalUnsnaps
      = [
        this.getPracticalUnsnap(time, 16, timingPoint),
        this.getPracticalUnsnap(time, 12, timingPoint),
        this.getPracticalUnsnap(time, 9, timingPoint),
        this.getPracticalUnsnap(time, 7, timingPoint),
        this.getPracticalUnsnap(time, 5, timingPoint),
      ];

    // Assume the closest possible snapping & retain signed values.
    const minUnsnap = minBy(practicalUnsnaps, Math.abs);

    return practicalUnsnaps.find(unsnap => almostEquals(Math.abs(unsnap), minUnsnap))!;
  }

  getTheoreticalUnsnap(time: number, divisor: number, timingPoint?: TimingPoint) {
    timingPoint ??= this.controlPoints.timingPointAt(time);

    const beatOffset = this.getOffsetIntoBeat(time);
    const currentFraction = beatOffset / timingPoint.beatLength;

    const desiredFraction = Math.round(currentFraction * divisor) / divisor;
    const differenceFraction = currentFraction - desiredFraction;

    return differenceFraction * timingPoint.beatLength;
  }

  getOffsetIntoBeat(time: number) {
    const timingPoint = this.controlPoints.timingPointAt(time);

    // gets how many miliseconds into a beat we are
    const msOffset = time - timingPoint.time;
    const division = msOffset / timingPoint.beatLength;
    const fraction = division - Math.floor(division);

    return fraction * timingPoint.beatLength;
  }

  clone(): IBeatmap<T> {
    return this;
  }
}

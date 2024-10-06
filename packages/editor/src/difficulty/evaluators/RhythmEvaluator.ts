import { almostEquals, clamp } from 'osucad-framework';
import { Slider } from '../../beatmap/hitObjects/Slider.ts';
import { Spinner } from '../../beatmap/hitObjects/Spinner.ts';
import { OsuDifficultyHitObject } from '../preprocessing/OsuDifficultyHitObject.ts';

const history_time_max = 5 * 1000; // 5 seconds
const history_objects_max = 32;
const rhythm_overall_multiplier = 0.95;
const rhythm_ratio_multiplier = 12.0;

export class RhythmEvaluator {
  static evaluateDifficultyOf(current: OsuDifficultyHitObject) {
    if (current.baseObject instanceof Spinner)
      return 0;

    let rhythmComplexitySum = 0;

    const deltaDifferenceEpsilon = current.hitWindowGreat * 0.3;

    let island = new Island(deltaDifferenceEpsilon);
    let previousIsland = new Island(deltaDifferenceEpsilon);

    // we can't use dictionary here because we need to compare island with a tolerance
    // which is impossible to pass into the hash comparer
    const islandCounts: { island: Island; count: number }[] = [];

    let startRatio = 0; // store the ratio of the current start of an island to buff for tighter rhythms

    let firstDeltaSwitch = false;

    const historicalNoteCount = Math.min(current.index, history_objects_max);

    let rhythmStart = 0;

    while (rhythmStart < historicalNoteCount - 2 && current.startTime - current.previous(rhythmStart)!.startTime < history_time_max)
      rhythmStart++;

    let prevObj = current.previous(rhythmStart);
    let lastObj = current.previous(rhythmStart + 1);

    // we go from the furthest object back to the current one
    for (let i = rhythmStart; i > 0; i--) {
      const currObj = current.previous(i - 1)!;

      // scales note 0 to 1 from history to now
      const timeDecay = (history_time_max - (current.startTime - currObj.startTime)) / history_time_max;
      const noteDecay = (historicalNoteCount - i) / historicalNoteCount;

      const currHistoricalDecay = Math.min(noteDecay, timeDecay); // either we're limited by time or limited by object count.

      const currDelta = currObj.strainTime;
      const prevDelta = prevObj!.strainTime;
      const lastDelta = lastObj!.strainTime;

      // calculate how much current delta difference deserves a rhythm bonus
      // this function is meant to reduce rhythm bonus for deltas that are multiples of each other (i.e 100 and 200)
      const deltaDifferenceRatio = Math.min(prevDelta, currDelta) / Math.max(prevDelta, currDelta);
      const currRatio = 1.0 + rhythm_ratio_multiplier * Math.min(0.5, Math.sin(Math.PI / deltaDifferenceRatio) ** 2);

      // reduce ratio bonus if delta difference is too big
      const fraction = Math.max(prevDelta / currDelta, currDelta / prevDelta);
      const fractionMultiplier = clamp(2.0 - fraction / 8.0, 0.0, 1.0);

      const windowPenalty = Math.min(1, Math.max(0, Math.abs(prevDelta - currDelta) - deltaDifferenceEpsilon) / deltaDifferenceEpsilon);

      let effectiveRatio = windowPenalty * currRatio * fractionMultiplier;

      if (firstDeltaSwitch) {
        if (Math.abs(prevDelta - currDelta) < deltaDifferenceEpsilon) {
          // island is still progressing
          island.addDelta(Math.floor(currDelta));
        }
        else {
          // bpm change is into slider, this is easy acc window
          if (currObj.baseObject instanceof Slider)
            effectiveRatio *= 0.125;

          // bpm change was from a slider, this is easier typically than circle -> circle
          // unintentional side effect is that bursts with kicksliders at the ends might have lower difficulty than bursts without sliders
          if (prevObj!.baseObject instanceof Slider)
            effectiveRatio *= 0.3;

          // repeated island polarity (2 -> 4, 3 -> 5)
          if (island.isSimilarPolarity(previousIsland))
            effectiveRatio *= 0.5;

          // previous increase happened a note ago, 1/1->1/2-1/4, dont want to buff this.
          if (lastDelta > prevDelta + deltaDifferenceEpsilon && prevDelta > currDelta + deltaDifferenceEpsilon)
            effectiveRatio *= 0.125;

          // repeated island size (ex: triplet -> triplet)
          // TODO: remove this nerf since its staying here only for balancing purposes because of the flawed ratio calculation
          if (previousIsland.deltaCount === island.deltaCount)
            effectiveRatio *= 0.5;

          const islandCount = islandCounts.find(x => x.island.equals(island));

          if (islandCount !== undefined) {
            const countIndex = islandCounts.indexOf(islandCount);

            // only add island to island counts if they're going one after another
            if (previousIsland.equals(island))
              islandCount.count++;

            // repeated island (ex: triplet -> triplet)
            const power = this.#logistic(island.delta, 2.75, 0.24, 14);
            effectiveRatio *= Math.min(3.0 / islandCount.count, (1.0 / islandCount.count) ** power);

            islandCounts[countIndex] = { island: islandCount.island, count: islandCount.count };
          }
          else {
            islandCounts.push({ island, count: 1 });
          }

          // scale down the difficulty if the object is doubletappable
          const doubletapness = prevObj!.getDoubletapness(prevObj!.next(0));
          effectiveRatio *= 1 - doubletapness * 0.75;

          rhythmComplexitySum += Math.sqrt(effectiveRatio * startRatio) * currHistoricalDecay;

          startRatio = effectiveRatio;

          previousIsland = island;

          if (prevDelta + deltaDifferenceEpsilon < currDelta) // we're slowing down, stop counting
            firstDeltaSwitch = false; // if we're speeding up, this stays true and we keep counting island size.

          island = new Island(Math.floor(currDelta), deltaDifferenceEpsilon);
        }
      }
      else if (prevDelta > currDelta + deltaDifferenceEpsilon) { // we're speeding up
        // Begin counting island until we change speed again.
        firstDeltaSwitch = true;

        // bpm change is into slider, this is easy acc window
        if (currObj.baseObject instanceof Slider)
          effectiveRatio *= 0.6;

        // bpm change was from a slider, this is easier typically than circle -> circle
        // unintentional side effect is that bursts with kicksliders at the ends might have lower difficulty than bursts without sliders
        if (prevObj!.baseObject instanceof Slider)
          effectiveRatio *= 0.6;

        startRatio = effectiveRatio;

        island = new Island(currDelta, deltaDifferenceEpsilon);
      }

      lastObj = prevObj;
      prevObj = currObj;
    }

    return Math.sqrt(4 + rhythmComplexitySum * rhythm_overall_multiplier) / 2.0; // produces multiplier that can be applied to strain. range [1, infinity) (not really though)
  }

  static #logistic(x: number, maxValue: number, multiplier: number, offset: number) {
    return (maxValue / (1 + Math.E ** (offset - (multiplier * x))));
  }
}

class Island {
  readonly #deltaDifferenceEpsilon: number;
  delta = Number.MAX_SAFE_INTEGER;
  deltaCount = 0;

  constructor(epsilon: number, delta?: number) {
    this.#deltaDifferenceEpsilon = epsilon;
    if (delta !== undefined) {
      this.delta = Math.max(delta, OsuDifficultyHitObject.MIN_DELTA_TIME);
      this.deltaCount++;
    }
  }

  addDelta(delta: number) {
    if (this.delta === Number.MAX_SAFE_INTEGER)
      this.delta = Math.max(delta, OsuDifficultyHitObject.MIN_DELTA_TIME);

    this.deltaCount++;
  }

  isSimilarPolarity(other: Island) {
    return this.deltaCount % 2 === other.deltaCount % 2;
  }

  equals(other: Island) {
    return almostEquals(this.delta, other.delta, this.#deltaDifferenceEpsilon) && this.deltaCount === other.deltaCount;
  }
}

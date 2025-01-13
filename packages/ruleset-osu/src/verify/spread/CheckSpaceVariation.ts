import type { CheckMetadata, Issue, VerifierBeatmap } from '@osucad/common';
import type { OsuHitObject } from '../../hitObjects/OsuHitObject';
import { BeatmapCheck, DifficultyType, IssueTemplate, sumBy, zipWithNext } from '@osucad/common';
import { Spinner } from '../../hitObjects/Spinner';

// Ported from https://github.com/Naxesss/MapsetVerifier/blob/main/src/Checks/Standard/Spread/CheckSpaceVariation.cs
export class CheckSpaceVariation extends BeatmapCheck<OsuHitObject> {
  override get metadata(): CheckMetadata {
    return {
      category: 'Spread',
      message: 'Object too close or far away from previous',
      author: 'Naxess',
      difficulties: [
        DifficultyType.Easy,
        DifficultyType.Normal,
      ],
    };
  }

  override templates = {
    distance: new IssueTemplate('warning', '{0} Distance is {1} px, expected {2}, see {3:timestamp}.', 'timestamp - ', 'distance', 'distance', 'example objects').withCause('The distance between two hit objects noticeably contradicts a recent use of time distance balance between another ' + 'two hit objects using a similar time gap.'),
    ratio: new IssueTemplate('warning', '{0} Distance/time ratio is {1}, expected {2}.', 'timestamp - ', 'ratio', 'ratio').withCause('The distance/time ratio between the previous hit objects greatly contradicts a following use of distance/time ratio.'),
  };

  override async* getIssues(beatmap: VerifierBeatmap<OsuHitObject>): AsyncGenerator<Issue, void, undefined> {
    let deltaTime: number;

    const observedDistances: ObservedDistance[] = [];
    let observedIssue: ObservedDistance | null = null;

    const leniencyPercent = 0.15;
    const leniencyAbsolute = 10;

    const snapLeniencyPercent = 0.1;

    const ratioLeniencyPercent = 0.2;
    const ratioLeniencyAbsolute = 0.1;

    for (const [hitObject, nextObject] of zipWithNext(beatmap.hitObjects.items)) {
      if (hitObject instanceof Spinner || nextObject instanceof Spinner)
        continue;

      const deltaTime = nextObject.startTime - hitObject.endTime;

      if (deltaTime > 600)
        continue;

      const distance = nextObject.stackedPosition.distance(hitObject.stackedEndPosition);

      // Ignore stacks and half-stacks, since these are relatively normal.
      if (distance < 8)
        continue;

      const closeDistanceSum = sumBy(observedDistances, observedDistance => observedDistance.hitObject.startTime > hitObject.startTime - 4000 ? observedDistance.distance / observedDistance.deltaTime : 0);

      const closeDistanceCount = observedDistances.filter(observedDistance => observedDistance.hitObject.startTime > hitObject.startTime - 4000).length;

      const hasCloseDistances = closeDistanceCount > 0;
      const avrRatio = hasCloseDistances ? closeDistanceSum / closeDistanceCount : -1;

      const index = observedDistances.findLastIndex(observedDistance => deltaTime <= observedDistance.deltaTime * (1 + snapLeniencyPercent) && deltaTime >= observedDistance.deltaTime * (1 - snapLeniencyPercent) && observedDistance.hitObject.startTime > hitObject.startTime - 4000);

      if (index !== -1) {
        const distanceExpected = observedDistances[index].distance;

        if ((Math.abs(distanceExpected - distance) - leniencyAbsolute) / distance > leniencyPercent) {
          const distanceExpectedAlternate = observedIssue?.distance ?? 0;

          if (observedIssue != null && Math.abs(distanceExpectedAlternate - distance) / distance <= leniencyPercent) {
            observedDistances[index] = {
              deltaTime,
              distance,
              hitObject,
              nextObject,
            };
            observedIssue = null;
          }
          else {
            const prevObject = observedDistances[index].hitObject;
            const prevNextObject = observedDistances[index].nextObject;

            yield this.createIssue(this.templates.distance, beatmap, [hitObject, nextObject], Math.round(distance), Math.round(distanceExpected), [prevObject, prevNextObject]);

            observedIssue = {
              deltaTime,
              distance,
              hitObject,
              nextObject,
            };
          }
        }
        else {
          observedDistances[index] = {
            deltaTime,
            distance,
            hitObject,
            nextObject,
          };
          observedIssue = null;
        }
      }
      else {
        if (hasCloseDistances && (distance / deltaTime - ratioLeniencyAbsolute > avrRatio * (1 + ratioLeniencyPercent) || distance / deltaTime + ratioLeniencyAbsolute < avrRatio * (1 - ratioLeniencyPercent))) {
          const ratio = (distance / deltaTime).toFixed(2);
          const ratioExpected = avrRatio.toFixed(2);

          yield this.createIssue(this.templates.ratio, beatmap, [hitObject, nextObject], ratio, ratioExpected);
        }
        else {
          observedDistances.push({ deltaTime, distance, hitObject, nextObject });
          observedIssue = null;
        }
      }
    }
  }
}

interface ObservedDistance {
  deltaTime: number;
  distance: number;
  hitObject: OsuHitObject;
  nextObject: OsuHitObject;
}

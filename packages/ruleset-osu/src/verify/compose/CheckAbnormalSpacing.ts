import type { CheckMetadata, HitObject, Issue, VerifierBeatmap } from '@osucad/core';
import type { OsuHitObject } from '../../hitObjects/OsuHitObject';
import { avgBy, BeatmapCheck, DrawableTimestamp, HitObjectTimestamp, IssueTemplate, maxOf, trimIndent, zipWithNext } from '@osucad/core';
import { Slider } from '../../hitObjects/Slider';
import { Spinner } from '../../hitObjects/Spinner';

// Ported from https://github.com/Naxesss/MapsetVerifier/blob/main/src/Checks/Standard/Compose/CheckAbnormalSpacing.cs
export class CheckAbnormalSpacing extends BeatmapCheck<OsuHitObject> {
  override get metadata(): CheckMetadata {
    return {
      category: 'Compose',
      message: 'Abnormally large spacing.',
      author: 'Naxess',
      documentation: [
        {
          title: 'Purpose',
          description: trimIndent(`
              Prevent the time/distance ratio of hit objects from being absurdly large, even for higher difficulties.
              This is often a cause of an object being snapped a 1/4th tick earlier, and has been a common reason for unranks.
          `),
        },
        {
          title: 'Reasoning',
          description: trimIndent(`
              With two objects being spaced way further than previous objects of the same snapping, it can be extremely
              difficult to expect, much less play.
              <br><br>
              When combined with incorrect snappings (which abnormal spacing is often a cause of), this can really throw
              players off to the point where the map is pretty much considered unplayable.
          `),
        },
      ],
    };
  }

  override templates = {
    problem: new IssueTemplate('problem', '{0:timestamp} Space/time ratio is {1} times the expected, see e.g. {2} {3} {4}.', 'timestamp - ', 'times', 'example objects').withCause(trimIndent(`
      The space/time ratio between two objects is absurdly large in comparison to other objects with the same snapping prior.
      <note>
        Accounts for slider leniency by assuming that the gap is a circle's diameter smaller.
      </note>
    `)),
    warning: new IssueTemplate('warning', '{0:timestamp} Space/time ratio is {1} times the expected, see e.g. {2} {3} {4}.', 'timestamp - ', 'times', 'example objects').withCause('Same as the first check, but with slightly less absurd, yet often still extreme, differences.'),
    minor: new IssueTemplate('minor', '{0:timestamp} Space/time ratio is {1} times the expected, see e.g. {2} {3} {4}.', 'timestamp - ', 'times', 'example objects').withCause('Same as the first check, but with more common differences.'),
  };

  override async * getIssues(beatmap: VerifierBeatmap<OsuHitObject>): AsyncGenerator<Issue, void, undefined> {
    const observedDistances: ObservedDistance[] = [];

    const ratioProblemThreshold = 15.0;
    const ratioWarningThreshold = 4.0;
    const ratioMinorThreshold = 2.0;

    const snapLeniencyMs = 5;

    for (const [hitObject, next] of zipWithNext(beatmap.hitObjects.items)) {
      if (hitObject instanceof Spinner || next instanceof Spinner)
        continue;

      const deltaTime = next.startTime - hitObject.endTime;

      if (deltaTime > 100)
        continue;

      let distance = Math.max(
        hitObject.stackedEndPosition.distance(next.stackedPosition),
        20,
      );

      const sameSnappedDistances = observedDistances.filter(observedDistance =>
        deltaTime <= observedDistance.deltaTime + snapLeniencyMs
        && deltaTime >= observedDistance.deltaTime - snapLeniencyMs
        && (observedDistance.hitObject instanceof Slider) === (hitObject instanceof Slider),
      );

      observedDistances.push({
        deltaTime,
        distance,
        hitObject,
        nextHitObject: next,
      });

      if (sameSnappedDistances.length === 0 || distance / deltaTime < maxOf(sameSnappedDistances.map(obvDist => obvDist.distance / obvDist.deltaTime * decay(hitObject, obvDist))))
        continue;

      if (distance <= hitObject.radius * 4)
        continue;

      if (sameSnappedDistances.length < 3)
        // Too few samples, probably going to get inaccurate readings.
        continue;

      const expectedDistance = avgBy(sameSnappedDistances, obvDist => obvDist.distance * decay(hitObject, obvDist));

      const expectedDeltaTime = avgBy(sameSnappedDistances, obvDist => obvDist.deltaTime * decay(hitObject, obvDist));

      if (hitObject instanceof Slider)
      // Account for slider follow circle leniency.
        distance -= Math.min(hitObject.radius * 3, distance);

      const actualExpectedRatio = distance / deltaTime / (expectedDistance / expectedDeltaTime);

      if (actualExpectedRatio <= ratioMinorThreshold)
        continue;

      const ratio = Math.round(actualExpectedRatio * 10) / 10;

      const comparisonTimestamps = sameSnappedDistances
        .filter(obvDist => new HitObjectTimestamp([obvDist.hitObject, obvDist.nextHitObject]))
        .slice(-3)
        .map(it => new DrawableTimestamp(it.hitObject.startTime, [it.hitObject, it.nextHitObject]));

      if (actualExpectedRatio > ratioProblemThreshold) {
        yield this.createIssue(this.templates.problem, beatmap, [hitObject, next], ratio, ...comparisonTimestamps);
      }
      else if (actualExpectedRatio > ratioWarningThreshold) {
        yield this.createIssue(this.templates.warning, beatmap, [hitObject, next], ratio, ...comparisonTimestamps);
      }
      else {
        yield this.createIssue(this.templates.minor, beatmap, [hitObject, next], ratio, ...comparisonTimestamps);
      }
    }
  }
}

interface ObservedDistance {
  deltaTime: number;
  distance: number;
  hitObject: OsuHitObject;
  nextHitObject: OsuHitObject;
}

function decay(hitObject: HitObject, obvDist: ObservedDistance) {
  return Math.min(1 / (hitObject.startTime - obvDist.hitObject.startTime) * 4000, 1);
}

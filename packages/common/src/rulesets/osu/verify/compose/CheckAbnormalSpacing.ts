import type { IBeatmap } from '../../../../beatmap/IBeatmap';
import type { HitObject } from '../../../../hitObjects/HitObject';
import type { IssueMetadata, IssueOptions } from '../../../../verifier/Issue';
import type { OsuHitObject } from '../../hitObjects/OsuHitObject';
import { avgBy, maxBy, zipWithNext } from '../../../../utils/arrayUtils';
import { trimIndent } from '../../../../utils/stringUtils';
import { BeatmapCheck } from '../../../../verifier/BeatmapCheck';
import { HitObjectTimestamp } from '../../../../verifier/HitObjectTimestamp';
import { Issue } from '../../../../verifier/Issue';
import { Slider } from '../../hitObjects/Slider';
import { Spinner } from '../../hitObjects/Spinner';

// Ported from https://github.com/Naxesss/MapsetVerifier/blob/main/src/Checks/Standard/Compose/CheckAbnormalSpacing.cs
export class AbnormalSpacingIssue extends Issue {
  constructor(options: IssueOptions) {
    super(options);
  }

  override get metadata(): IssueMetadata {
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
}

export class CheckAbnormalSpacing extends BeatmapCheck<OsuHitObject> {
  override* getIssues(beatmap: IBeatmap<OsuHitObject>): Generator<Issue, void, undefined> {
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

      if (sameSnappedDistances.length === 0 || distance / deltaTime < maxBy(sameSnappedDistances, obvDist => obvDist.distance / obvDist.deltaTime * decay(hitObject, obvDist)))
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

      const comparisonTimestamps = sameSnappedDistances.filter(obvDist => new HitObjectTimestamp([obvDist.hitObject, obvDist.nextHitObject])).slice(-3).join(', ');

      if (actualExpectedRatio > ratioProblemThreshold) {
        yield new AbnormalSpacingIssue({
          level: 'problem',
          message: `Space/time ratio is ${ratio} times the expected, see e.g. ${comparisonTimestamps}.`,
          timestamp: hitObject,
          cause: trimIndent(`
            The space/time ratio between two objects is absurdly large in comparison to other objects with the same snapping prior.
            <note>
                Accounts for slider leniency by assuming that the gap is a circle's diameter smaller.
            </note>
          `),
        });
      }
      else if (actualExpectedRatio > ratioWarningThreshold) {
        yield new AbnormalSpacingIssue({
          level: 'warning',
          message: `Space/time ratio is ${ratio} times the expected, see e.g. ${comparisonTimestamps}.`,
          timestamp: hitObject,
        });
      }
      else {
        yield new AbnormalSpacingIssue({
          level: 'minor',
          message: `Space/time ratio is ${ratio} times the expected, see e.g. ${comparisonTimestamps}.`,
          timestamp: hitObject,
        });
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
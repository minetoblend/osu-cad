import type { EditorBeatmap } from 'packages/common/src/editor';
import type { HitObject } from '../../../hitObjects/HitObject';
import type { Issue } from '../../../verifier/Issue';
import type { OsuHitObject } from '../hitObjects/OsuHitObject';
import { maxBy } from '../../../utils/arrayUtils';
import { zipWithNext } from '../../../utils/zipWithNext';
import { BeatmapCheck } from '../../../verifier/BeatmapCheck';
import { Slider } from '../hitObjects/Slider';
import { Spinner } from '../hitObjects/Spinner';

export class AbnormalSpacingCheck extends BeatmapCheck<OsuHitObject> {
  override* check(beatmap: EditorBeatmap<OsuHitObject>): Generator<Issue, void, undefined> {
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

      const distance = Math.max(
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
      });

      if (sameSnappedDistances.length === 0 || distance / deltaTime < maxBy(sameSnappedDistances, obvDist => obvDist.distance / obvDist.deltaTime * decay(hitObject, obvDist)))
        continue;
    }
  }
}

interface ObservedDistance {
  deltaTime: number;
  distance: number;
  hitObject: HitObject;
}

function decay(hitObject: HitObject, obvDist: ObservedDistance) {
  return Math.min(1 / (hitObject.startTime - obvDist.hitObject.startTime) * 4000, 1);
}

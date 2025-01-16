import type { HitObject, IBeatmap } from '@osucad/core';
import type { OsuHitObject } from './hitObjects/OsuHitObject';
import { Vec2 } from '@osucad/framework';
import { HitCircle } from './hitObjects/HitCircle';
import { Slider } from './hitObjects/Slider';
import { Spinner } from './hitObjects/Spinner';

export class StackingProcessor {
  applyToBeatmap(beatmap: IBeatmap) {
    this.#calculateStacking(
      beatmap.hitObjects.items as OsuHitObject[],
      beatmap.beatmapInfo.stackLeniency,
      3,
      0,
      beatmap.hitObjects.length - 1,
    );
  }

  #calculateStacking(
    hitObjects: ReadonlyArray<OsuHitObject>,
    stackLeniency: number,
    stackDistance: number,
    startIndex: number,
    endIndex: number,
  ) {
    let extendedEndIndex = endIndex;
    const alteredObjects = new Set<HitObject>();
    for (let i = startIndex; i <= endIndex; i++) {
      hitObjects[i].stackHeight = 0;
      hitObjects[i].stackRoot = undefined;
    }
    if (stackLeniency === 0)
      return;

    if (endIndex < hitObjects.length - 1) {
      for (let i = endIndex; i >= startIndex; i--) {
        let stackBaseIndex = i;
        for (let n = stackBaseIndex + 1; n < hitObjects.length; n++) {
          const stackBaseObject = hitObjects[stackBaseIndex];
          const objectN = hitObjects[n];

          const endTime = stackBaseObject.endTime;
          const stackThreshold = objectN.timePreempt * stackLeniency;

          if (objectN.startTime - endTime > stackThreshold)
            break;

          if (
            Vec2.distance(stackBaseObject.position, objectN.position)
            < stackDistance
            || (stackBaseObject instanceof Slider
              && Vec2.distance(stackBaseObject.endPosition, objectN.position)
              < stackDistance)
          ) {
            stackBaseIndex = n;
            objectN.stackHeight = 0;
            objectN.stackRoot = undefined;
            alteredObjects.add(objectN);
          }
        }

        if (stackBaseIndex > extendedEndIndex) {
          extendedEndIndex = stackBaseIndex;
          if (extendedEndIndex === hitObjects.length - 1)
            break;
        }
      }
    }

    let extendedStartIndex = startIndex;
    for (let i = extendedEndIndex; i >= extendedStartIndex; i--) {
      let n = i;

      let objectI = hitObjects[i];
      if (objectI.stackHeight !== 0 || objectI instanceof Spinner)
        continue;

      const stackThreshold = objectI.timePreempt * stackLeniency;

      if (objectI instanceof HitCircle) {
        while (--n >= 0) {
          const objectN = hitObjects[n];
          if (objectN instanceof Spinner)
            continue;

          const endTime = objectN.endTime;

          if (objectI.startTime - endTime > stackThreshold)
            break;

          if (n < extendedStartIndex && objectN.stackRoot === objectI.id) {
            extendedStartIndex = n;
            objectN.stackHeight = 0;
            objectN.stackRoot = undefined;
            alteredObjects.add(objectN);
          }

          if (
            objectN instanceof Slider
            && Vec2.distance(objectN.endPosition, objectI.position) < stackDistance
          ) {
            const offset = objectI.stackHeight - objectN.stackHeight + 1;

            for (let j = n + 1; j <= i; j++) {
              const objectJ = hitObjects[j];
              if (
                Vec2.distance(objectN.endPosition, objectJ.position)
                < stackDistance
              ) {
                objectJ.stackHeight -= offset;
                objectJ.stackRoot = objectN.id;
                alteredObjects.add(objectJ);
              }
            }

            break;
          }

          if (
            Vec2.distance(objectN.position, objectI.position) < stackDistance
          ) {
            objectN.stackHeight = objectI.stackHeight + 1;
            objectN.stackRoot = objectI.id;
            alteredObjects.add(objectN);
            objectI = objectN;
          }
        }
      }
      else if (objectI instanceof Slider) {
        while (--n >= startIndex) {
          const objectN = hitObjects[n];

          if (objectI.startTime - objectN.endTime > stackThreshold)
            break;

          if (
            Vec2.distance(objectN.endPosition, objectI.position) < stackDistance
          ) {
            objectN.stackHeight = objectI.stackHeight + 1;
            alteredObjects.add(objectN);
            objectI = objectN;
          }
        }
      }
    }
  }
}

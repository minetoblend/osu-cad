import {
  BeatmapDifficulty,
  Circle,
  HitObject,
  HitObjectCollection,
  Slider,
  Vec2,
} from "@osucad/common";
import { computed, nextTick } from "vue";

export function trackHitObjectStacking(
  hitObjects: HitObjectCollection,
  difficulty: BeatmapDifficulty
) {
  const stackLeniency = 7;
  const stackDistance = 3;

  const stackThreshold = difficulty.timePreempt * stackLeniency;

  calculateStacking(hitObjects.items, stackThreshold, stackDistance);

  const invalidated = new Set<HitObject>();

  function updateInvalidatedStacking() {
    if (invalidated.size === 0) return;

    // const hitObjects = [...invalidated].sort(
    //   (a, b) => a.startTime - b.startTime
    // );

    calculateStacking(hitObjects.items, stackThreshold, stackDistance);

    invalidated.clear();
  }

  function invalidateStacking(hitObject: HitObject) {
    if (invalidated.has(hitObject)) return;

    invalidated.add(hitObject);

    if (hitObject.stackedUnder) {
      hitObject.stackedUnder.stackedOn.delete(hitObject);

      invalidateStacking(hitObject.stackedUnder);
      hitObject.stackedUnder = null;
    }

    hitObject.stackedOn.forEach(invalidateStacking);
    hitObject.stackedOn.clear();

    nextTick(updateInvalidatedStacking);
  }

  hitObjects.on("itemChange", (hitObject, key) => {
    if (
      key === "startTime" ||
      key === "position" ||
      key === "controlPoints" ||
      key === "expectedDistance" ||
      key === "spans"
    ) {
      invalidateStacking(hitObject);
    }
  });

  hitObjects.on("insert", invalidateStacking);
  hitObjects.on("remove", invalidateStacking);
}

function calculateStacking(
  hitObjects: HitObject[],
  stackThreshold: number,
  stackDistance: number
) {
  for (let i = hitObjects.length - 1; i >= 0; i--) {
    const current = hitObjects[i];

    const currentPositions = [current.position];
    if (current instanceof Slider)
      currentPositions.push(current.pathEndposition);

    for (
      let j = i - 1;
      j >= 0 && hitObjects[j].endTime > current.startTime - stackThreshold;
      j--
    ) {
      const h = hitObjects[j];
      if (h.stackedUnder) continue;
      if (
        currentPositions.some(
          (position) => Vec2.distance(position, h.position) < stackDistance
        )
      ) {
        current.stackedUnder = h;
        h.stackedOn.add(current);
        break;
      } else if (
        h instanceof Slider &&
        currentPositions.some(
          (position) =>
            Vec2.distance(position, h.pathEndPosition) < stackDistance
        )
      ) {
        current.stackedUnder = h;
        h.stackedOn.add(current);
        break;
      }
    }
  }

  for (const h of hitObjects) {
    h.stackHeight.value = getStackHeight(h);
  }
}

function getStackHeight(hitObject: HitObject): number {
  if (hitObject.stackedUnder) return 1 + getStackHeight(hitObject.stackedUnder);
  return 0;
}

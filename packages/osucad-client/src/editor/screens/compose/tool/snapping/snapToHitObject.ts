import { HitObject, Slider, Vec2 } from "@osucad/common";
import { SnapProvider, SnapResult } from ".";
import { Ref, inject, toRaw } from "vue";
import { MaybeComputedRef, resolveUnref } from "@vueuse/core";

export function HitObjectSnapProvider(
  exclude: MaybeComputedRef<HitObject[]> = []
): SnapProvider {
  const thresholdSquared = 5 * 5;

  const visibleHitObjects = inject("visibleHitObjects") as
    | Ref<HitObject[]>
    | undefined;

  return (positions: Vec2[]) => {
    let bestResult: SnapResult | undefined = undefined;

    const excludedHitObjects = resolveUnref(exclude);

    if (!visibleHitObjects) return [];

    const hitObjects = toRaw(visibleHitObjects.value).filter(
      (hitObject) => !hitObject.isGhost && !excludedHitObjects.includes(hitObject)
    );

    const hitObjectPositions = hitObjects.flatMap((hitObject) => {
      if (hitObject instanceof Slider) {
        return [
          hitObject.position,
          hitObject.pathEndposition,
        ]
      }
      return [hitObject.position];
    });

    for (const position of positions) {
      for (const hitObjectPosition of hitObjectPositions) {
        const offset = Vec2.sub(hitObjectPosition, position);
        const lengthSquared = Vec2.lengthSquared(offset);
        if (
          lengthSquared < thresholdSquared &&
          (!bestResult || lengthSquared < Vec2.lengthSquared(bestResult.offset))
        )
          bestResult = {
            offset,
          };
      }
    }

    return bestResult ? [bestResult] : [];
  };
}

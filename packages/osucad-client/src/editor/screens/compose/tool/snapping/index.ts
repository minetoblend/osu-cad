import { HitObject, Vec2 } from "@osucad/common";
import { HitObjectSnapProvider } from "./snapToHitObject";
import { Graphics } from "pixi.js";
import { MaybeComputedRef } from "@vueuse/core";

export type SnapProvider = (
  positions: Vec2[],
  hitObjects: HitObject[]
) => SnapResult | SnapResult[] | undefined;

export type SnapResult = {
  offset: Vec2;
  draw?: (g: Graphics) => void;
};

export function createSnapManager(options: SnapOptions = {}) {
  const snapProviders: SnapProvider[] = [HitObjectSnapProvider(options.excludeHitObjects)];

  function snap(positions: Vec2[]) {
    let bestResult: SnapResult | undefined = undefined;

    const results = snapProviders.flatMap((snap) => snap(positions, []) ?? []);

    for (const result of results) {
      if (
        !bestResult ||
        Vec2.lengthSquared(result.offset) <
          Vec2.lengthSquared(bestResult.offset)
      )
        bestResult = result;
    }

    return bestResult?.offset;
  }

  return {
    snap,
  };
}

export type SnapOptions = {
  excludeHitObjects?: MaybeComputedRef<HitObject[]>;
}
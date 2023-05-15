import { Vec2 } from "@osucad/common";
import { Bounds } from "pixi.js";
import { HitObject } from "@osucad/common";
import { assert, clamp } from "@vueuse/core";

export function getHitObjectBounds(
  hitObjects: HitObject[],
  positions?: Vec2[]
) {
  if (positions !== undefined) {
    assert(
      hitObjects.length === positions.length,
      "hitObjects.length === positions.length"
    );
  }

  const bounds = new Bounds();

  hitObjects.forEach((hitObject, index) => {
    bounds.addPoint(positions?.[index] ?? hitObject.position);
  });

  return bounds;
}

export function clampHitObjectMovement(
  movement: Vec2,
  hitObjects: HitObject[],
  positions?: Vec2[]
) {
  const bounds = getHitObjectBounds(hitObjects, positions);

  const minX = 0 - bounds.minX;
  const minY = 0 - bounds.minY;
  const maxX = 512 - bounds.maxX;
  const maxY = 384 - bounds.maxY;

  return Vec2.create(
    clamp(movement.x, minX, maxX),
    clamp(movement.y, minY, maxY)
  );
}

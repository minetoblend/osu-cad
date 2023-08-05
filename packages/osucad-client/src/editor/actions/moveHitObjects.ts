import {Vec2, HitObject} from "@osucad/common";

export function moveHitObjects(
  hitObjects: HitObject[],
  offset: Vec2,
) {
  hitObjects.forEach((hitObject) => {
    hitObject.position = Vec2.add(hitObject.position, offset);
  });
}
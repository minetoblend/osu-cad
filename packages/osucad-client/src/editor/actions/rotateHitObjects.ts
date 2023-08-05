import {HitObject, Slider, Vec2} from "@osucad/common";

export function rotateHitObjects(hitObjects: HitObject[], angle: number, origin: Vec2 = {
  x: 512 / 2,
  y: 384 / 2,
}): void {
  hitObjects.forEach((hitObject) => {
    hitObject.position = Vec2.rotateAround(hitObject.position, origin, angle);

    if (hitObject instanceof Slider) {
      const controlPoints = hitObject.controlPoints;
      controlPoints.controlPoints.forEach((controlPoint, index) => {
        controlPoint.position = Vec2.rotateAround(controlPoint.position, Vec2.zero(), angle);
        controlPoints.update(index, controlPoint);
      });

    }
  });
}
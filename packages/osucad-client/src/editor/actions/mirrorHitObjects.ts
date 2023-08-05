import {HitObject, Slider} from "@osucad/common";


export function mirrorHitObjects(
  hitObjects: HitObject[],
  axis: "x" | "y" | "xy",
) {
  hitObjects.forEach((hitObject) => {
    let position = hitObject.position;
    if (axis === "x" || axis === "xy")
      position = { x: 512 - position.x, y: position.y };
    if (axis === "y" || axis === "xy")
      position = { x: position.x, y: 384 - position.y };

    hitObject.position = position;

    if (hitObject instanceof Slider) {
      const controlPoints = hitObject.controlPoints;
      controlPoints.controlPoints.forEach((controlPoint, index) => {
        const position = controlPoint.position;
        if (axis === "x" || axis === "xy")
          controlPoint.position = { x: -position.x, y: position.y };
        if (axis === "y" || axis === "xy")
          controlPoint.position = { x: position.x, y: -position.y };
        controlPoints.update(index, controlPoint);
      });
    }
  });
}
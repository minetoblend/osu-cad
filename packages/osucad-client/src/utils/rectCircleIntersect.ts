import { Vec2 } from "@osucad/common";
import { Rectangle } from "pixi.js";

export function rectCircleIntersection(
  rect: Rectangle,
  circle: Vec2,
  r: number
) {
  const circleDistance = {
    x: Math.abs(circle.x - (rect.x + rect.width / 2)),
    y: Math.abs(circle.y - (rect.y + rect.height / 2)),
  };

  if (circleDistance.x > rect.width / 2 + r) {
    return false;
  }
  if (circleDistance.y > rect.height / 2 + r) {
    return false;
  }

  if (
    circleDistance.x <= rect.width / 2 ||
    circleDistance.y <= rect.height / 2
  ) {
    return true;
  }

  const cornerDistance_sq =
    (circleDistance.x - rect.width / 2) * (circleDistance.x - rect.width / 2) +
    (circleDistance.y - rect.height / 2) * (circleDistance.y - rect.height / 2);

  return cornerDistance_sq <= r * r;
}

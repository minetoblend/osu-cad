import type { Vec2 } from "@osucad/framework";
import { PathApproximator } from "@osucad/core";

function interpolateInPlace(a: Vec2, b: Vec2, progress: number)
{
  a.x = a.x + (b.x - a.x) * progress;
  a.y = a.y + (b.y - a.y) * progress;
}

/**
 * I have no idea how this works atp but the result seems to be correct ¯\_(ツ)_/¯
 * @remarks this will modify the original array
 */
export function getBezierSlice(points: Vec2[], progress: number)
{
  if (points.length <= 1)
    return points;

  const result = new Array<Vec2>(points.length - 1);

  result[0] = points[0];

  let iteration = 0;

  while(iteration < points.length - 1)
  {
    for (let i = iteration + 1; i < points.length; i++)
      interpolateInPlace(points[i], points[i - 1], progress);

    result[++iteration] = points[iteration];
  }

  return result;
}

export function getCircularArcSlice(points: Vec2[], progress: number)
{
  if (points.length !== 3)
    return getBezierSlice(points, progress);

  const arcProperties = PathApproximator.getCircularArcProperties(points);

  if (!arcProperties.isValid)
    return getBezierSlice(points, progress);

  return [
    points[0],
    arcProperties.pointAtProgress(progress * 0.5),
    arcProperties.pointAtProgress(progress),
  ];
}

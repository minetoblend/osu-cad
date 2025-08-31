import { PathApproximator } from "@osucad/core";
import type { Vec2 } from "@osucad/framework";

function interpolateInPlace(a: Vec2, b: Vec2, progress: number)
{
  a.x = a.x + (b.x - a.x) * progress;
  a.y = a.y + (b.y - a.y) * progress;
}

function getDistance(points: Vec2[])
{
  let distance = 0;

  for (let i = 0; i < points.length - 1; i++)
    distance += points[i].distance(points[i + 1]);

  return distance;
}

export function bezierDistanceToProgress(
  points: Vec2[],
  distance: number,
  tolerance = 0.5,
)
{

  let min = 0;
  let max = 1;

  let current = 0.5;
  let currentDistance = 0;
  let iteration = 0;

  do
  {
    const slice = getBezierSlice(points.map(it => it.clone()), current);
    const d = getDistance(PathApproximator.approximateBezier(slice));

    if (d > distance)
      max = current;
    else
      min = current;

    current = min + (max - min) / 2;
    currentDistance = d;

    if (iteration++ > 50)
      break;
  } while (Math.abs(distance - currentDistance) > tolerance);

  return current;
}

export function getLinearSlice(points: Vec2[], progress: number)
{
  if (points.length === 0 || progress >= 1)
    return points;

  const result: Vec2[] = [points[0]];
  let totalDistance = 0;

  for (let i = 1; i < points.length; i++)
    totalDistance += points[i].distance(points[i - 1]);

  if (totalDistance === 0)
    return points;

  let currentProgress = 0;

  for (let i = 1; i < points.length; i++)
  {
    const p = points[i].distance(points[i - 1]) / totalDistance;

    if (currentProgress + p < progress)
    {
      result.push(points[i]);
      currentProgress += p;
      continue;
    }

    const remaining = progress - currentProgress;

    result.push(points[i - 1].lerp(points[i], remaining / p));
    break;
  }

  return result;
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
      interpolateInPlace(points[i], points[i - 1], 1 - progress);

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

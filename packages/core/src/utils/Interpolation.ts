import type { Vec2 } from "@osucad/framework";

/**
 * Calculates the Barycentric weights
 * for a Lagrange polynomial for a given set of coordinates.
 * Can be used as a helper function
 * to compute a Lagrange polynomial repeatedly.
 * @param points An array of coordinates. No two x should be the same.
 */
export function barycentricWeights(points: Vec2[]): number[] 
{
  const n = points.length;
  const w = [];

  for (let i = 0; i < n; i++) 
  {
    w[i] = 1;

    for (let j = 0; j < n; j++) 
    {
      if (i !== j) 
      {
        w[i] *= points[i].x - points[j].x;
      }
    }

    w[i] = 1.0 / w[i];
  }

  return w;
}

/**
 * Calculates the Lagrange basis polynomial
 * for a given set of x coordinates
 * based on previously computed barycentric weights.
 * @param points An array of coordinates. No two x should be the same.
 * @param weights An array of precomputed barycentric weights.
 * @param time The x coordinate to calculate the basis polynomial for.
 */
export function barycentricLagrange(
  points: Vec2[],
  weights: number[],
  time: number,
): number 
{
  if (points === null || points.length === 0) 
  {
    throw new Error("points must contain at least one point");
  }

  if (points.length !== weights.length) 
  {
    throw new Error("points must contain exactly as many items as weights");
  }

  let numerator = 0;
  let denominator = 0;

  for (let i = 0, len = points.length; i < len; ++i) 
  {
    /**
     * While this is not great with branch prediction,
     * it prevents NaN at control point X coordinates
     */
    if (time === points[i].x) 
    {
      return points[i].y;
    }

    const li = weights[i] / (time - points[i].x);

    numerator += li * points[i].y;
    denominator += li;
  }

  return numerator / denominator;
}

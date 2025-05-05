import { List, Vec2 } from "@osucad/framework";
import { barycentricLagrange, barycentricWeights } from "./Interpolation";

/**
 * Ported from https://github.com/kionell/osu-classes/blob/c2e0fc184f5603cdf8d5d6240d437ec0a0499a91/src/Objects/Path/PathApproximator.ts
 */
export class PathApproximator 
{
  static readonly BEZIER_TOLERANCE = Math.fround(0.5);
  static readonly CIRCULAR_ARC_TOLERANCE = Math.fround(0.1);

  /**
   * The amount of pieces to calculate for each control point quadruplet.
   */
  static readonly CATMULL_DETAIL = 50;

  /**
   * Creates a piecewise-linear approximation of a Bézier curve, by adaptively repeatedly subdividing
   * the control points until their approximation error vanishes below a given threshold.
   * @param controlPoints The control points of the path.
   * @returns A list of vectors representing the piecewise-linear approximation.
   */
  static approximateBezier(controlPoints: Vec2[]): Vec2[] 
  {
    return this.approximateBSpline(controlPoints);
  }

  static approximateBSpline(controlPoints: Vec2[], p = 0): Vec2[] 
  {
    const output = new List<Vec2>(100);
    const n = controlPoints.length - 1;

    if (n < 0)
      return output.array;

    const toFlatten = new List<Vec2[]>(100);
    const freeBuffers = new List<Vec2[]>(100);

    const points = controlPoints.slice();

    if (p > 0 && p < n) 
    {
      // Subdivide B-spline into bezier control points at knots.
      for (let i = 0; i < n - p; ++i) 
      {
        const subBezier: Vec2[] = [points[i]];

        // Destructively insert the knot p-1 times via Boehm's algorithm.
        for (let j = 0; j < p - 1; ++j) 
        {
          subBezier[j + 1] = points[i + 1];

          for (let k = 1; k < p - j; ++k) 
          {
            const l = Math.min(k, n - p - i);

            points[i + k] = (points[i + k]
              .scale(l)
              .add(points[i + k + 1]))
              .divF(l + 1);
          }
        }

        subBezier[p] = points[i + 1];
        toFlatten.push(subBezier);
      }

      toFlatten.push(points.slice(n - p));
      // Reverse the stack so elements can be accessed in order.
      toFlatten.reverse();
    }
    else 
    {
      // B-spline subdivision unnecessary, degenerate to single bezier.
      p = n;
      toFlatten.push(points);
    }

    /**
     * "toFlatten" contains all the curves which are not yet approximated well enough.
     * We use a stack to emulate recursion without the risk of running into a stack overflow.
     * (More specifically, we iteratively and adaptively refine our curve
     * with a {@link https://en.wikipedia.org/wiki/Depth-first_search|Depth-first search}
     * over the tree resulting from the subdivisions we make.)
     */

    const subdivisionBuffer1: Vec2[] = [];
    const subdivisionBuffer2: Vec2[] = [];

    const leftChild = subdivisionBuffer2;

    while (toFlatten.length > 0) 
    {
      const parent = toFlatten.pop() || [];

      if (this._bezierIsFlatEnough(parent)) 
      {
        /**
         * If the control points we currently operate on are sufficiently "flat", we use
         * an extension to De Casteljau's algorithm to obtain a piecewise-linear approximation
         * of the bezier curve represented by our control points, consisting of the same amount
         * of points as there are control points.
         */
        this._bezierApproximate(parent, output, subdivisionBuffer1, subdivisionBuffer2, p + 1);

        freeBuffers.push(parent);
        continue;
      }

      /**
       * If we do not yet have a sufficiently "flat" (in other words, detailed) approximation we keep
       * subdividing the curve we are currently operating on.
       */
      const rightChild = freeBuffers.pop() || [];

      this._bezierSubdivide(parent, leftChild, rightChild, subdivisionBuffer1, p + 1);

      /**
       * We re-use the buffer of the parent for one of the children,
       * so that we save one allocation per iteration.
       */
      for (let i = 0; i < p + 1; ++i) 
      {
        parent[i] = leftChild[i];
      }

      toFlatten.push(rightChild);
      toFlatten.push(parent);
    }

    output.push(controlPoints[n]);

    return output.array;
  }

  /**
   * Creates a piecewise-linear approximation of a Catmull-Rom spline.
   * @param controlPoints The control points of the path.
   * @returns A list of vectors representing the piecewise-linear approximation.
   */
  static approximateCatmull(controlPoints: Vec2[]): Vec2[] 
  {
    const output = [];
    const controlPointsLength = controlPoints.length;

    for (let i = 0; i < controlPointsLength - 1; i++) 
    {
      const v1 = i > 0 ? controlPoints[i - 1] : controlPoints[i];
      const v2 = controlPoints[i];
      const v3 = i < controlPointsLength - 1
          ? controlPoints[i + 1]
          : v2.add(v2).sub(v1);

      const v4 = i < controlPointsLength - 2
          ? controlPoints[i + 2]
          : v3.add(v3).sub(v2);

      for (let c = 0; c < PathApproximator.CATMULL_DETAIL; c++) 
      {
        output.push(
            PathApproximator._catmullFindPoint(v1, v2, v3, v4, Math.fround(Math.fround(c) / PathApproximator.CATMULL_DETAIL)),
        );

        output.push(
            PathApproximator._catmullFindPoint(v1, v2, v3, v4, Math.fround(Math.fround(c + 1) / PathApproximator.CATMULL_DETAIL)),
        );
      }
    }

    return output;
  }

  /**
   * Creates a piecewise-linear approximation of a circular arc curve.
   * @param controlPoints The control points of the path.
   * @returns A list of vectors representing the piecewise-linear approximation.
   */
  static approximateCircularArc(controlPoints: Vec2[]): Vec2[] 
  {
    const pr = this._circularArcProperties(controlPoints);

    if (!pr.isValid) 
    {
      return this.approximateBezier(controlPoints);
    }

    /**
     * We select the amount of points for the approximation by requiring the discrete curvature
     * to be smaller than the provided tolerance. The exact angle required to meet the tolerance
     * is: 2 * Math.Acos(1 - TOLERANCE / r)
     * The special case is required for extremely short sliders where the radius is smaller than
     * the tolerance. This is a pathological rather than a realistic case.
     */
    let amountPoints = 2;

    if (2 * pr.radius > PathApproximator.CIRCULAR_ARC_TOLERANCE) 
    {
      let angle = Math.fround(PathApproximator.CIRCULAR_ARC_TOLERANCE / pr.radius);

      angle = Math.fround(1 - angle);
      angle = Math.fround(2 * Math.fround(Math.acos(angle)));

      const points = Math.ceil(Math.fround(pr.thetaRange / angle));

      /**
       * Edge case for beatmaps with huge radius and infinite points:
       * https://osu.ppy.sh/beatmapsets/1235519#osu/2568364
       */
      const validPoints = !Number.isFinite(points) ? -(2 ** 31) : points;

      amountPoints = Math.max(2, validPoints);
    }

    const output: Vec2[] = [];

    for (let i = 0; i < amountPoints; ++i) 
    {
      const fract = i / (amountPoints - 1);
      const theta = pr.thetaStart + pr.direction * fract * pr.thetaRange;

      const vector2 = new Vec2(
          Math.fround(Math.cos(theta)),
          Math.fround(Math.sin(theta)),
      );

      output.push(vector2.scale(pr.radius).add(pr.centre));
    }

    return output;
  }

  /**
   * Computes various properties that can be used to approximate the circular arc.
   * @param controlPoints Three distinct points on the arc.
   * @returns The properties for approximation of the circular arc.
   */
  static _circularArcProperties(controlPoints: Vec2[]): CircularArcProperties 
  {
    const a = controlPoints[0];
    const b = controlPoints[1];
    const c = controlPoints[2];

    /**
     * If we have a degenerate triangle where a side-length is almost zero,
     * then give up and fallback to a more numerically stable method.
     */
    const sideLength = (
      (b.y - a.y) * (c.x - a.x)
        - (b.x - a.x) * (c.y - a.y)
    );

    if (Math.abs(sideLength) < 0.001) 
    {
      return new CircularArcProperties();
    }

    const d = 2 * (
      (a.x * (b.y - c.y))
        + (b.x * (c.y - a.y))
        + (c.x * (a.y - b.y))
    );

    const aSq = a.lengthSq();

    const bSq = b.lengthSq();

    const cSq = c.lengthSq();

    const centre = new Vec2(
        aSq * (b.y - c.y)
        + (bSq * (c.y - a.y))
        + (cSq * (a.y - b.y)),
        (aSq * (c.x - b.x))
        + (bSq * (a.x - c.x))
        + (cSq * (b.x - a.x)),
    ).divF(d);

    const dA = a.sub(centre);
    const dC = c.sub(centre);

    const radius = dA.length();

    const thetaStart = Math.atan2(dA.y, dA.x);
    let thetaEnd = Math.atan2(dC.y, dC.x);

    while (thetaEnd < thetaStart) 
    {
      thetaEnd += 2 * Math.PI;
    }

    let direction = 1;
    let thetaRange = thetaEnd - thetaStart;

    /**
     * Decide in which direction to draw the circle, depending on which side of
     * AC B lies.
     */
    let orthoAtoC = c.sub(a);

    orthoAtoC = new Vec2(orthoAtoC.y, -orthoAtoC.x);

    if (orthoAtoC.dot(b.sub(a)) < 0) 
    {
      direction = -direction;
      thetaRange = 2 * Math.PI - thetaRange;
    }

    return new CircularArcProperties(thetaStart, thetaRange, direction, radius, centre);
  }

  /**
   * Creates a piecewise-linear approximation of a linear curve.
   * Basically, returns the input.
   * @param controlPoints The control points of the path.
   * @returns A list of vectors representing the piecewise-linear approximation.
   */
  static approximateLinear(controlPoints: Vec2[]): Vec2[] 
  {
    return controlPoints.slice();
  }

  /**
   * Creates a piecewise-linear approximation of a lagrange polynomial.
   * @param controlPoints The control points of the path.
   * @returns A list of vectors representing the piecewise-linear approximation.
   */
  static approximateLagrangePolynomial(controlPoints: Vec2[]): Vec2[] 
  {
    // TODO: add some smarter logic here, chebyshev nodes?
    const NUM_STEPS = 51;

    const output = [];

    const weights = barycentricWeights(controlPoints);

    let minX = controlPoints[0].x;
    let maxX = controlPoints[0].x;

    for (let i = 1, len = controlPoints.length; i < len; i++) 
    {
      minX = Math.min(minX, controlPoints[i].x);
      maxX = Math.max(maxX, controlPoints[i].x);
    }

    const dx = maxX - minX;

    for (let i = 0; i < NUM_STEPS; i++) 
    {
      const x = minX + (dx / (NUM_STEPS - 1)) * i;
      const y = Math.fround(barycentricLagrange(controlPoints, weights, x));

      output.push(new Vec2(x, y));
    }

    return output;
  }

  /**
   * Make sure the 2nd order derivative (approximated using finite elements) is within tolerable bounds.
   * NOTE: The 2nd order derivative of a 2d curve represents its curvature, so intuitively this function
   *       checks (as the name suggests) whether our approximation is _locally_ "flat". More curvy parts
   *       need to have a denser approximation to be more "flat".
   * @param controlPoints The control points to check for flatness.
   * @returns Whether the control points are flat enough.
   */
  private static _bezierIsFlatEnough(controlPoints: Vec2[]): boolean 
  {
    let Vec2;

    for (let i = 1, len = controlPoints.length; i < len - 1; i++) 
    {
      Vec2 = controlPoints[i - 1]
        .sub(controlPoints[i].scale(2))
        .add(controlPoints[i + 1]);

      if (Vec2.lengthSq() > PathApproximator.BEZIER_TOLERANCE ** 2 * 4) 
      {
        return false;
      }
    }

    return true;
  }

  /**
   * Subdivides n control points representing a bezier curve into 2 sets of n control points, each
   * describing a bezier curve equivalent to a half of the original curve. Effectively this splits
   * the original curve into 2 curves which result in the original curve when pieced back together.
   * @param controlPoints The control points to split.
   * @param l Output: The control points corresponding to the left half of the curve.
   * @param r Output: The control points corresponding to the right half of the curve.
   * @param subdivisionBuffer The first buffer containing the current subdivision state.
   * @param count The number of control points in the original list.
   */
  private static _bezierSubdivide(
    controlPoints: Vec2[],
    l: Vec2[],
    r: Vec2[],
    subdivisionBuffer: Vec2[],
    count: number,
  ): void 
  {
    const midpoints = subdivisionBuffer;

    for (let i = 0; i < count; ++i) 
    {
      midpoints[i] = controlPoints[i];
    }

    for (let i = 0; i < count; ++i) 
    {
      l[i] = midpoints[0];
      r[count - i - 1] = midpoints[count - i - 1];

      for (let j = 0; j < count - i - 1; j++) 
      {
        midpoints[j] = midpoints[j].add(midpoints[j + 1]).divF(2);
      }
    }
  }

  /**
   * This uses De Casteljau's algorithm to obtain an optimal
   * piecewise-linear approximation of the bezier curve with the same amount of points as there are control points.
   * @param controlPoints The control points describing the bezier curve to be approximated.
   * @param output The points representing the resulting piecewise-linear approximation.
   * @param subdivisionBuffer1 The first buffer containing the current subdivision state.
   * @param subdivisionBuffer2 The second buffer containing the current subdivision state.
   * @param count The number of control points in the original list.
   */
  private static _bezierApproximate(
    controlPoints: Vec2[],
    output: List<Vec2>,
    subdivisionBuffer1: Vec2[],
    subdivisionBuffer2: Vec2[],
    count: number,
  ): void 
  {
    const l = subdivisionBuffer2;
    const r = subdivisionBuffer1;

    PathApproximator._bezierSubdivide(controlPoints, l, r, subdivisionBuffer1, count);

    for (let i = 0; i < count - 1; ++i) 
    {
      l[count + i] = r[i + 1];
    }

    output.push(controlPoints[0]);

    for (let i = 1; i < count - 1; ++i) 
    {
      const index = 2 * i;
      const p = l[index - 1]
        .add(l[index].scale(2))
        .add(l[index + 1])
        .scale(Math.fround(0.25));

      output.push(p);
    }
  }

  /**
   * Finds a point on the spline at the position of a parameter.
   * @param vec1 The first vector.
   * @param vec2 The second vector.
   * @param vec3 The third vector.
   * @param vec4 The fourth vector.
   * @param t The parameter at which to find the point on the spline, in the range [0, 1].
   * @returns The point on the spline at t.
   */
  private static _catmullFindPoint(
    vec1: Vec2,
    vec2: Vec2,
    vec3: Vec2,
    vec4: Vec2,
    t: number,
  ): Vec2 
  {
    const t2 = Math.fround(t * t);
    const t3 = Math.fround(t * t2);

    const coordinates: number[] = [];

    /**
     * Please help me...
     *
     * result.X = 0.5f * (2f * vec2.X + (-vec1.X + vec3.X) * t + (2f * vec1.X - 5f * vec2.X + 4f * vec3.X - vec4.X) * t2 + (-vec1.X + 3f * vec2.X - 3f * vec3.X + vec4.X) * t3);
     * result.Y = 0.5f * (2f * vec2.Y + (-vec1.Y + vec3.Y) * t + (2f * vec1.Y - 5f * vec2.Y + 4f * vec3.Y - vec4.Y) * t2 + (-vec1.Y + 3f * vec2.Y - 3f * vec3.Y + vec4.Y) * t3);
     */
    for (let i = 0; i <= 1; ++i) 
    {
      const value1 = i === 0 ? vec1.x : vec1.y;
      const value2 = i === 0 ? vec2.x : vec2.y;
      const value3 = i === 0 ? vec3.x : vec3.y;
      const value4 = i === 0 ? vec4.x : vec4.y;

      const v1 = Math.fround(2 * value2);
      const v2 = Math.fround(value3 - value1);

      const v31 = Math.fround(2 * value1);
      const v32 = Math.fround(5 * value2);
      const v33 = Math.fround(4 * value3);

      const v41 = Math.fround(3 * value2);
      const v42 = Math.fround(3 * value3);

      const v5 = Math.fround(v2 * t);

      const v61 = Math.fround(v31 - v32);
      const v62 = Math.fround(v61 + v33);
      const v63 = Math.fround(v62 - value4);
      const v6 = Math.fround(v63);

      const v71 = Math.fround(v41 - value1);
      const v72 = Math.fround(v71 - v42);
      const v7 = Math.fround(v72 + value4);

      const v8 = Math.fround(v6 * t2);
      const v9 = Math.fround(v7 * t3);

      const v101 = Math.fround(v1 + v5);
      const v102 = Math.fround(v101 + v8);
      const v10 = Math.fround(v102 + v9);

      coordinates.push(Math.fround(Math.fround(0.5) * v10));
    }

    return new Vec2(coordinates[0], coordinates[1]);
  }
}

/**
 * The properties for approximation of the circular arc.
 */
export class CircularArcProperties 
{
  /**
   * Whether the properties are valid.
   */
  readonly isValid: boolean;

  /**
   * Starting angle of the circle.
   */
  readonly thetaStart: number;

  /**
   * The angle of the drawn circle.
   */
  readonly thetaRange: number;

  /**
   * The direction in which the circle will be drawn.
   */
  readonly direction: number;

  /**
   * The radius of a circle.
   */
  readonly radius: number;

  /**
   * The centre position of a circle.
   */
  readonly centre: Vec2;

  constructor(thetaStart?: number, thetaRange?: number, direction?: number, radius?: number, centre?: Vec2) 
  {
    this.isValid = !!(thetaStart || thetaRange || direction || radius || centre);
    this.thetaStart = thetaStart || 0;
    this.thetaRange = thetaRange || 0;
    this.direction = direction || 0;
    this.radius = radius ? Math.fround(radius) : 0;
    this.centre = centre || new Vec2(0, 0);
  }

  get thetaEnd(): number 
  {
    return this.thetaStart + this.thetaRange * this.direction;
  }
}

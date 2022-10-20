import {Vec2} from "@/util/math";


export class PathApproximator {


    private static bezierTolerance = 0.5;
    private static circularArcTolerance = 0.1


    static bezierSubdivide(controlPoints: Vec2[], l: Vec2[], r: Vec2[], subdivisionBuffer: Vec2[], count: number) {
        let midpoints = subdivisionBuffer;

        for (let i = 0; i < count; ++i)
            midpoints[i] = controlPoints[i];

        for (let i = 0; i < count; i++) {
            l[i] = midpoints[0];
            r[count - i - 1] = midpoints[count - i - 1];

            for (let j = 0; j < count - i - 1; j++)
                midpoints[j] = midpoints[j].add(midpoints[j + 1]).divF(2);
        }
    }

    static bezierApproximate(controlPoints: Vec2[], output: Vec2[], subdivisionBuffer1: Vec2[], subdivisionBuffer2: Vec2[], count: number) {
        let l = subdivisionBuffer2;
        let r = subdivisionBuffer1;

        this.bezierSubdivide(controlPoints, l, r, subdivisionBuffer1, count);

        for (let i = 0; i < count - 1; ++i)
            l[count + i] = r[i + 1];

        output.push(controlPoints[0]);

        for (let i = 1; i < count - 1; ++i) {
            const index = 2 * i;
            const p = l[index - 1].add(l[index].mulF(2)).add(l[index + 1]).mulF(0.25);
            output.push(p);
        }
    }

    static approximateBSpline(points: Vec2[], p = 0): Vec2[] {
        const output: Vec2[] = []
        const n = points.length - 1;
        if (n < 0)
            return output;
        let toFlatten: Vec2[][] = []
        let freeBuffers: Vec2[][] = [];

        if (p > 0 && p < n) {
            // Subdivide B-spline into bezier control points at knots.
            for (let i = 0; i < n - p; i++) {
                let subBezier: Vec2[] = [];
                subBezier[0] = points[i];

                // Destructively insert the knot p-1 times via Boehm's algorithm.
                for (let j = 0; j < p - 1; j++) {
                    subBezier[j + 1] = points[i + 1];

                    for (let k = 1; k < p - j; k++) {
                        const l = Math.min(k, n - p - i);
                        points[i + k] = (points[i + k].mulF(l).add(points[i + k + 1])).subF(l + 1)
                    }
                }

                subBezier[p] = points[i + 1];
                toFlatten.push(subBezier);
            }

            toFlatten.push(points.slice(n - p));
            // Reverse the stack so elements can be accessed in order.
            toFlatten = [...toFlatten]
        } else {
            // B-spline subdivision unnecessary, degenerate to single bezier.
            p = n;
            toFlatten.push([...points]);
        }


        let subdivisionBuffer1: Vec2[] = []
        let subdivisionBuffer2: Vec2[] = []

        let leftChild = subdivisionBuffer2;

        while (toFlatten.length > 0) {
            const parent = toFlatten.pop()!;

            if (this.bezierIsFlatEnough(parent)) {
                // If the control points we currently operate on are sufficiently "flat", we use
                // an extension to De Casteljau's algorithm to obtain a piecewise-linear approximation
                // of the bezier curve represented by our control points, consisting of the same amount
                // of points as there are control points.
                this.bezierApproximate(parent, output, subdivisionBuffer1, subdivisionBuffer2, p + 1);

                freeBuffers.push(parent);
                continue;
            }

            // If we do not yet have a sufficiently "flat" (in other words, detailed) approximation we keep
            // subdividing the curve we are currently operating on.
            const rightChild = freeBuffers.pop() ?? [];
            this.bezierSubdivide(parent, leftChild, rightChild, subdivisionBuffer1, p + 1);

            // We re-use the buffer of the parent for one of the children, so that we save one allocation per iteration.
            for (let i = 0; i < p + 1; ++i)
                parent[i] = leftChild[i];

            toFlatten.push(rightChild);
            toFlatten.push(parent);
        }

        output.push(points[n]);
        return output;


    }

    private static bezierIsFlatEnough(controlPoints: Vec2[]) {
        for (let i = 1; i < controlPoints.length - 1; i++) {
            if (controlPoints[i - 1]
                .sub(controlPoints[i].mulF(2))
                .add(controlPoints[i + 1])
                .lengthSquared > this.bezierTolerance * this.bezierTolerance * 4) {
                return false;
            }
        }

        return true;
    }

    static circularArcProperties(controlPoints: Vec2[]) {
        if(controlPoints.length < 3)
            return undefined

        const a = controlPoints[0];
        const b = controlPoints[1];
        const c = controlPoints[2];

        // If we have a degenerate triangle where a side-length is almost zero, then give up and fallback to a more numerically stable method.
        if (Math.abs((b.y - a.y) * (c.x - a.x) - (b.x - a.x) * (c.y - a.y)) < 0.01)
            return undefined; // Implicitly sets `IsValid` to false

        // See: https://en.wikipedia.org/wiki/Circumscribed_circle#Cartesian_coordinates_2
        const d = 2 * (a.x * (b.y - c.y) + b.x * (c.y - a.y) + c.x * (a.y - b.y));
        const aSq = a.lengthSquared;
        const bSq = b.lengthSquared;
        const cSq = c.lengthSquared;

        const centre = new Vec2(
            aSq * (b.y - c.y) + bSq * (c.y - a.y) + cSq * (a.y - b.y),
            aSq * (c.x - b.x) + bSq * (a.x - c.x) + cSq * (b.x - a.x)).divF(d);

        const dA = a.sub(centre);
        const dC = c.sub(centre);

        const r = dA.length;

        let thetaStart = Math.atan2(dA.y, dA.x);
        let thetaEnd = Math.atan2(dC.y, dC.x);

        while (thetaEnd < thetaStart)
            thetaEnd += 2 * Math.PI;

        let dir = 1;
        let thetaRange = thetaEnd - thetaStart;

        // Decide in which direction to draw the circle, depending on which side of
        // AC B lies.
        let orthoAtoC = c.sub(a);
        orthoAtoC = new Vec2(orthoAtoC.y, -orthoAtoC.x);

        if (Vec2.dot(orthoAtoC, b.sub(a)) < 0) {
            dir = -dir;
            thetaRange = 2 * Math.PI - thetaRange;
        }

        return {thetaStart, thetaRange, dir, radius: r, centre};
    }

    static approximateCircularArc(controlPoints: Vec2[]) {
        if (controlPoints.length !== 3)
            return this.approximateBSpline(controlPoints);
        const pr = this.circularArcProperties(controlPoints);
        if (!pr || pr.radius > 2000)
            return this.approximateBSpline(controlPoints);

        // We select the amount of points for the approximation by requiring the discrete curvature
        // to be smaller than the provided tolerance. The exact angle required to meet the tolerance
        // is: 2 * Math.Acos(1 - TOLERANCE / r)
        // The special case is required for extremely short sliders where the radius is smaller than
        // the tolerance. This is a pathological rather than a realistic case.
        const amountPoints = 2 * pr.radius <= this.circularArcTolerance ? 2 : Math.max(2, Math.ceil(pr.thetaRange / (2 * Math.acos(1 - this.circularArcTolerance / pr.radius))));

        const output: Vec2[] = [];

        output.push(controlPoints[0])
        for (let i = 1; i < amountPoints; ++i) {
            const fract = i / (amountPoints - 1);
            const theta = pr.thetaStart + pr.dir * fract * pr.thetaRange;
            const o = new Vec2(Math.cos(theta), Math.sin(theta)).mulF(pr.radius);
            output.push(pr.centre.add(o));
        }

        return output;
    }
}
import {computed, Ref, shallowRef, toRefs, UnwrapRef, watch, watchEffect} from "vue";
import {ControlPoint, ControlPointType} from "@/editor/state/hitobject/slider";
import {PathApproximator, Vector2} from "osu-classes";
import {Bounds, Rectangle} from "pixi.js";
import {reactiveComputed} from "@vueuse/core";
import {lerp} from "@/util/math";


export function sliderPath(controlPoints: Ref<UnwrapRef<ControlPoint>[]>, pixelLength: Readonly<Ref<number>>, snakeIn: Readonly<Ref<number>>, snakeOut: Readonly<Ref<number>>, spans: Readonly<Ref<number>>) {

    const {
        calculatedPath: vertices,
        cumulativeLength
    } = toRefs(reactiveComputed(() => calculatePath(controlPoints.value)))

    const bounds = computed(() => getBounds(vertices.value))

    const path = computed(() => getRange(vertices.value, cumulativeLength.value, 0, 1, pixelLength.value))

    const snakedPath = computed(() => getRange(vertices.value, cumulativeLength.value, 0, 1, pixelLength.value))

    const endPosition = computed(() => path.value[path.value.length - 1] ?? new Vector2(0, 0))

    function positionAt(p: number) {
        let i = 0;

        const d0 = p * pixelLength.value;

        for (; i < vertices.value.length && cumulativeLength.value[i] < d0; ++i) {
        }

        return interpolateVertices(vertices.value, cumulativeLength.value, i, d0)
    }

    function getProgress(p: number) {
        p = Math.max(0, Math.min(1, p))

        const span = Math.floor(p * spans.value);
        const spanProgress = p * spans.value - span;
        if (span % 2 === 0) {
            return positionAt(spanProgress);
        }
        return positionAt(1 - spanProgress);
    }

    return {
        path,
        snakedPath,
        bounds,
        endPosition,
        positionAt,
        getProgress,
        getRange: (start: number, end: number) => getRange(vertices.value, cumulativeLength.value, start, end, pixelLength.value)
    };
}

function interpolateVertices(path: Vector2[], cumulativeLength: number[], i: number, d: number) {
    if (path.length === 0)
        return new Vector2(0, 0);

    if (i <= 0)
        return path[0];
    if (i >= path.length)
        return path[path.length - 1];

    let p0 = path[i - 1];
    let p1 = path[i];

    let d0 = cumulativeLength[i - 1];
    let d1 = cumulativeLength[i];


    // Avoid division by and almost-zero number in case two points are extremely close to each other.
    if (Math.abs(d0 - d1) < 0.001)
        return p0;

    const w = (d - d0) / (d1 - d0);
    return new Vector2(
        lerp(p0.x, p1.x, w),
        lerp(p0.y, p1.y, w)
    )
}

function getRange(fullPath: Vector2[], cumulativeLength: number[], start: number, end: number, pixelLength: number) {
    let d0 = start * pixelLength
    let d1 = end * pixelLength

    let i = 0;

    for (; i < fullPath.length && cumulativeLength[i] < d0; ++i) {
    }

    const path: Vector2[] = []
    path.push(interpolateVertices(fullPath, cumulativeLength, i, d0));

    for (; i < fullPath.length && cumulativeLength[i] <= d1; ++i) {
        const p = fullPath[i]
        if (!path[path.length - 1].equals(p))
            path.push(p);
    }

    const p = interpolateVertices(fullPath, cumulativeLength, i, d1)
    if (!path[path.length - 1].equals(p))
        path.push(p);

    return path
}

function calculatePath(controlPoints: ControlPoint[]) {
    const calculatedPath = [] as Vector2[]

    let start = 0;

    let cumulativeLength = [] as number[]

    for (let i = 0; i < controlPoints.length; i++) {
        if (controlPoints[i].kind === null && i < controlPoints.length - 1) {
            continue;
        }

        const segmentVertices = controlPoints.slice(start, i + 1).map(it => it.position);
        const segmentType = controlPoints[start].kind ?? ControlPointType.Linear;

        const subPath = calculateSubPath(segmentVertices, segmentType);

        for (const t of subPath) {
            const last = calculatedPath[calculatedPath.length - 1];

            if (calculatedPath.length === 0 || !last.equals(t)) {
                if (!last) {
                    cumulativeLength.push(0)
                } else {
                    cumulativeLength.push(cumulativeLength[cumulativeLength.length - 1] + t.distance(last))
                }

                calculatedPath.push(t);

            }
        }

        start = i
    }

    return {calculatedPath, cumulativeLength}
}

function calculateSubPath(vertices: Vector2[], type: ControlPointType) {
    switch (type) {
        case ControlPointType.Linear:
            return PathApproximator.approximateLinear(vertices);

        case ControlPointType.PerfectCurve:
            if (vertices.length !== 3) {
                break;
            }

            const subPath = PathApproximator.approximateCircularArc(vertices);

            if (subPath.length === 0) {
                break;
            }

            return subPath

        case ControlPointType.Catmull:
            return PathApproximator.approximateCatmull(vertices);
    }

    return PathApproximator.approximateBezier(vertices);
}

function getBounds(path: Vector2[]) {
    const bounds = new Bounds()

    for (const point of path) {
        bounds.addPoint(point)
    }

    return bounds
}

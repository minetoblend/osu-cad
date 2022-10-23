import {Vec2} from "@/util/math";
import {ref, shallowRef, watch} from "vue";
import {DisposableObject} from "@/util/disposable";
import {Rectangle} from "pixi.js";
import {PathApproximator} from "@/editor/hitobject/pathApproximator";
import {SliderControlPointType} from "@common/types";

export class SliderPath extends DisposableObject {

    calculatedPath = new CalculatedPath()

    #start = 0
    #end = 1


    get start() {
        return this.#start
    }

    get end() {
        return this.#end
    }

    set start(value) {
        if (isNaN(value))
            debugger;
        this.#start = value
    }

    set end(value) {
        this.#end = value
    }

    get endPosition() {
        return this.fullPath.value[this.fullPath.value.length - 1]
    }

    snakedPath = shallowRef<Vec2[]>([])
    fullPath = shallowRef<Vec2[]>([])

    readonly controlPoints = ref<SliderControlPoint[]>([])

    private _dirty = ref(true)
    expectedDistance: number = 0

    get dirty() {
        return this._dirty.value
    }

    constructor() {
        super()

        this.addDisposable(
            watch(this.controlPoints, () => {
                this.markDirty()
            }, {deep: true})
        )
    }

    markDirty() {
        this._dirty.value = true
    }


    calculatePath(knownLength = true) {
        this.calculatedPath.clear()

        if (this.controlPoints.value.length === 0)
            return

        let start = 0;
        for (let i = 0; i < this.controlPoints.value.length; i++) {

            let current = this.controlPoints.value[i]
            const isLast = i === this.controlPoints.value.length - 1

            if ((current.kind !== SliderControlPointType.None && i > 0) || isLast) {
                const vertices = this.controlPoints.value.slice(start, i + 1).map(it => it.position)


                this.calculatePathSegment(this.controlPoints.value[start].kind, vertices, isLast).forEach(t => {
                    this.calculatedPath.add(t)
                })

                start = i;
            }
        }
        this._dirty.value = false
        if (knownLength) {
            this.setSnakedRange(this.start, this.end, true)
            this.fullPath.value = this.getRange(0, 1)
        }
    }

    getProgress(p: number) {
        let i = 0;

        const d0 = p * this.expectedDistance;

        for (; i < this.calculatedPath.count && this.calculatedPath.cumulativeLength[i] < d0; ++i) {
        }

        return this.calculatedPath.interpolateVertices(i, d0)

    }

    setSnakedRange(start: number, end: number, forceWrite = false) {
        if (start === this.start && end === this.end && !forceWrite)
            return;
        this.start = start
        this.end = end

        this.snakedPath.value = this.getRange(start, end)
    }

    getRange(start: number, end: number) {
        let d0 = start * this.expectedDistance
        let d1 = end * this.expectedDistance

        let i = 0;

        for (; i < this.calculatedPath.count && this.calculatedPath.cumulativeLength[i] < d0; ++i) {
        }

        const path: Vec2[] = []
        path.push(this.calculatedPath.interpolateVertices(i, d0));

        for (; i < this.calculatedPath.count && this.calculatedPath.cumulativeLength[i] <= d1; ++i) {
            const p = this.calculatedPath.get(i)
            if (!path[path.length - 1].equals(p))
                path.push(p);
        }

        const p = this.calculatedPath.interpolateVertices(i, d1)
        if (!path[path.length - 1].equals(p))
            path.push(p);

        return path
    }

    calculatePathSegment(type: SliderControlPointType, vertices: Vec2[], isLast: boolean): Vec2[] {
        const output: Vec2[] = []

        switch (type) {
            case SliderControlPointType.Linear:
                output.push(...vertices);
                break;
            case SliderControlPointType.Bezier:
                return PathApproximator.approximateBSpline(vertices.map(it => it.clone()))
            case SliderControlPointType.Circle: {
                const segment = PathApproximator.approximateCircularArc(vertices.map(it => it.clone()))
                if (!isLast)
                    segment.pop()
                return segment
            }
        }


        return output
    }

    getBounds(snaked: boolean) {
        if (this.calculatedPath.values.length === 0)
            return null

        const values = snaked ? this.snakedPath.value : this.fullPath.value

        let min = new Vec2(this.calculatedPath.values[0], this.calculatedPath.values[1])
        let max = min.clone()

        values.forEach(p => {
            const x = p.x
            const y = p.y;

            if (x < min.x)
                min.x = x
            if (y < min.y)
                min.y = y
            if (x > max.x)
                max.x = x
            if (y > max.y)
                max.y = y
        })

        const rect = new Rectangle()

        rect.x = min.x
        rect.y = min.y
        rect.width = max.x - min.x
        rect.height = max.y - min.y

        return rect
    }
}

export class CalculatedPath {

    #points: number[] = []
    #cumulativeLength: number[] = []
    #length = 0

    clear() {
        this.#points = []
        this.#length = 0
        this.#cumulativeLength = []
    }

    add(position: Vec2) {
        if (this.#points.length > 0) {
            const lastX = this.#points[this.#points.length - 2]
            const lastY = this.#points[this.#points.length - 1]

            if (position.x === lastX && position.y === lastY)
                return;

            this.#length += Math.hypot(
                position.x - lastX,
                position.y - lastY
            )
        }
        this.#points.push(position.x, position.y)
        this.#cumulativeLength.push(this.#length)
    }

    get points(): Vec2[] {
        const points: Vec2[] = []
        for (let i = 0; i < this.#points.length; i += 2) {
            points.push(new Vec2(
                this.#points[i],
                this.#points[i + 1]
            ))
        }
        return points
    }

    get values() {
        return this.#points
    }

    get last() {
        return this.get(this.count - 1)
    }

    get cumulativeLength() {
        return this.#cumulativeLength
    }

    get count() {
        return this.#points.length >> 1
    }

    get totalLength() {
        return this.#length
    }

    get(i: number) {
        return new Vec2(
            this.values[(i << 1)],
            this.values[(i << 1) + 1]
        )
    }

    interpolateVertices(i: number, d: number): Vec2 {
        if (this.count === 0)
            return Vec2.zero();

        if (i <= 0)
            return this.get(0);
        if (i >= this.count)
            return this.last;

        let p0 = this.get(i - 1);
        let p1 = this.get(i);

        let d0 = this.#cumulativeLength[i - 1];
        let d1 = this.#cumulativeLength[i];

        // Avoid division by and almost-zero number in case two points are extremely close to each other.
        if (Math.abs(d0 - d1) < 0.001)
            return p0;

        const w = (d - d0) / (d1 - d0);
        return p0.lerp(p1, w)
    }


}


export class SliderControlPoint {
    position: Vec2
    kind: SliderControlPointType


    constructor(position: Vec2 = Vec2.zero(), kind: SliderControlPointType = SliderControlPointType.None) {
        this.position = position;
        this.kind = kind;
    }

    clone(deep = true) {
        return new SliderControlPoint(deep ? this.position.clone() : this.position, this.kind)
    }
}
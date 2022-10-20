import {ref, shallowRef, watchEffect} from "vue";
import {Graphics, IDestroyOptions} from "pixi.js";
import {Lifetime} from "@/util/disposable";
import {SliderControlPoint} from "@/editor/hitobject/sliderPath";
import {SliderControlPointType} from "@common/types";
import {ControlPointType} from "osu-classes";
import {pairwise} from "@/util/array";
import {Vec2} from "@/util/math";
import {Slider} from "@/editor/hitobject/slider";

export class PathVisualizer extends Graphics {

    static readonly hoverDistance = 10

    #hitObject = shallowRef<Slider>()

    set hitObject(value: Slider | undefined) {
        this.#hitObject.value = value
        this.hoveringControlPoint.value = undefined
        this.hoveringLine.value = undefined
    }

    get hitObject() {
        return this.#hitObject.value
    }

    private lifetime = new Lifetime()

    private hoveringControlPoint = ref<number>()
    hoveringLine = ref<number>()
    closestLine = ref<number>()

    constructor() {
        super();
        this.lifetime.add(watchEffect(() => this.drawVisualizer()))
    }

    get path() {
        return this.#hitObject.value?.overriddenPath
    }

    drawVisualizer() {
        this.clear()
        const path = this.#hitObject.value?.overriddenPath
        if (!path) return;

        const controlPoints = path.controlPoints.value

        pairwise(controlPoints, (curr, next) => {
            if (curr.kind !== SliderControlPointType.None)
                this.lineStyle(2, ControlPointStyle.styles[curr.kind].color)

            this.moveTo(curr.position.x, curr.position.y)
            this.lineTo(next.position.x, next.position.y)
        })

        controlPoints.forEach((c, index) => this.drawControlPoint(c, this.hoveringControlPoint.value === index))
    }

    drawControlPoint(controlPoint: SliderControlPoint, hovering: boolean) {
        let {radius, color} = ControlPointStyle.styles[controlPoint.kind]
        if (hovering)
            radius += 2

        this.lineStyle()
        this.beginFill(color)
        this.drawCircle(controlPoint.position.x, controlPoint.position.y, radius)
        this.endFill()
    }

    destroy(_options?: IDestroyOptions | boolean) {
        super.destroy(_options);
        this.lifetime.dispose()
    }

    onMouseMove(mousePos: Vec2) {
        if (this.path && this.path.controlPoints) {
            const distances = this.path.controlPoints.value.map(it => it.position.sub(mousePos).lengthSquared)
            let min = distances[0]
            let minIndex = 0
            distances.forEach((distance, index) => {
                if (distance < min) {
                    min = distance
                    minIndex = index
                }
            })
            if (min <= PathVisualizer.hoverDistance * PathVisualizer.hoverDistance) {
                this.hoveringControlPoint.value = minIndex
                return;
            }
        }
        this.hoveringControlPoint.value = undefined


        if (this.path && this.path.controlPoints) {


            function pDistance(p: Vec2, v: Vec2, w: Vec2) {

                const l2 = v.sub(w).lengthSquared
                if (l2 === 0)
                    return p.sub(v).length

                let t = ((p.x - v.x) * (w.x - v.x) + (p.y - v.y) * (w.y - v.y)) / l2
                t = Math.max(0, Math.min(1, t));

                return p.sub(new Vec2(
                    v.x + t * (w.x - v.x),
                    v.y + t * (w.y - v.y),
                )).length
            }

            let minDistance = Number.MAX_VALUE
            let minIndex = -1

            let last = this.path.controlPoints.value[0].position
            for (let i = 1; i < this.path.controlPoints.value.length; i++) {
                const cur = this.path.controlPoints.value[i].position

                const distance = pDistance(mousePos, last, cur)
                if (distance < minDistance) {
                    minIndex = i
                    minDistance = distance
                }
                last = cur
            }

            if (minDistance < 25) {
                this.hoveringLine.value = minIndex
            } else {
                this.hoveringLine.value = undefined
            }
            this.closestLine.value = minIndex >= 0 ? minIndex : undefined
        }
    }

    get hoveredControlPoint() {
        return this.hoveringControlPoint.value
    }

}

export class ControlPointStyle {

    constructor(readonly color: number, readonly radius: number) {
    }

    static readonly styles: Record<ControlPointType, ControlPointStyle> = {
        [SliderControlPointType.None]: new ControlPointStyle(0xdddddd, 4),
        [SliderControlPointType.Bezier]: new ControlPointStyle(0xfc3599, 6),
        [SliderControlPointType.Linear]: new ControlPointStyle(0x1eeb88, 6),
        [SliderControlPointType.Circle]: new ControlPointStyle(0x65a3fc, 6)
    }

}
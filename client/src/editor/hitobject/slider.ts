import {HitObject, HitObjectOverrides} from "@/editor/hitobject/index";
import {SerializedHitObject, SerializedSlider, SliderControlPointType} from "@common/types";
import {SliderControlPoint, SliderPath} from "@/editor/hitobject/sliderPath";
import {Vec2} from "@/util/math";
import {EditorContext} from "@/editor";
import {BeatmapState} from "@/editor/state/beatmap";
import {animate} from "@/util/animation";
import {ref, shallowRef} from "vue";
import gsap from 'gsap'

export class Slider extends HitObject<SerializedSlider, SliderOverrides> {

    path = new SliderPath()
    // repeatCount = 1
    //spanDuration = 0
    velocity = 1

    #repeatCount = ref(1)

    get repeatCount() {
        return this.#repeatCount.value
    }

    set repeatCount(value: number) {
        this.#repeatCount.value = value
    }


    get spanDuration() {
        return this.path.expectedLength * this.velocity
    }

    constructor() {
        super({
            position: null,
            selectedBy: null,
            time: null,
            controlPoints: null,
            expectedLength: null
        });
    }

    sliderBallProgress = 0

    get duration() {
        return this.spanDuration * this.repeatCount
    }

    get endTime() {
        return this.time + this.duration
    }

    updateFrom(serialized: SerializedHitObject): void {
        if (serialized.type !== 'slider')
            throw Error('Not a slider')
        let data = serialized as SerializedSlider

        super.updateFrom(serialized)

        this.path.controlPoints.value.splice(0)

        this.path.controlPoints.value.push(...data.controlPoints.map(it => new SliderControlPoint(
            Vec2.from(it.position),
            it.kind
        )))

        this.path.expectedLength = data.pixelLength

        this.repeatCount = data.repeatCount
    }


    applyDefaults(state: BeatmapState, ctx: EditorContext) {
        super.applyDefaults(state, ctx)

        const timing = state.timing.getTimingPointAt(this.time, true)!
        const overrides = state.timing.getTimingPointAt(this.time, false)!


        const sv = state.difficulty.sliderMultiplier.value * (overrides?.sv ?? 1.0)
        let beatDuration = timing.beatDuration!

        this.velocity = beatDuration / (100 * sv)

    }

    updateProgress(time: number) {

        if (this.overriddenSpanDuration === 0)
            return;


        if (time < this.overriddenTime) {
            const fadeinTime = 650
            const preemptTime = 450

            const progress = animate(time, this.overriddenTime - fadeinTime, this.overriddenTime - preemptTime, 0, 1)
            this.setSnakedRange(0, progress)
            this.sliderBallProgress = 0
        } else {
            let reversed = this.repeatCount % 2 === 1

            const snakeOutProgress = animate(time, this.overriddenEndTime - this.overriddenSpanDuration, this.overriddenEndTime, 0, 1)

            const currentRepeat = Math.floor((time - this.time) / this.overriddenSpanDuration)

            let progress = ((time - this.time) % this.overriddenSpanDuration) / this.overriddenSpanDuration


            if (time > this.overriddenEndTime)
                progress = 0

            if (currentRepeat % 2 === 1)
                progress = 1 - progress


            this.sliderBallProgress = progress

            if (isNaN(snakeOutProgress))
                debugger;

            if (true) {
                this.overriddenPath.setSnakedRange(0, 1)
            } else {
                if (reversed)
                    this.setSnakedRange(snakeOutProgress, 1)
                else
                    this.setSnakedRange(0, 1 - snakeOutProgress)
            }
        }

    }

    clearOverrides() {
        super.clearOverrides()
        this.#overriddenPath.value = undefined
        this.overrides.controlPoints = null
        this.overrides.expectedLength = null
    }

    serialized(): SerializedSlider {
        const points: Vec2[] = []
        this.path.controlPoints.value.forEach((p, index) => {
            if (index === 0)
                return;

            if (p.kind !== SliderControlPointType.None) {
                points.push(p.position.clone())
            }
            points.push(p.position.clone())
        })

        let curveType = 'bezier'
        if (this.path.controlPoints.value[0]?.kind === SliderControlPointType.Circle)
            curveType = 'pass-through'

        return {
            id: this.id,
            time: this.time,
            selectedBy: this.selectedBy.value,
            position: this.position,
            type: 'slider',
            repeatCount: this.repeatCount,
            controlPoints: this.path.controlPoints.value.map(it => it.clone()),
            pixelLength: this.path.expectedLength,
            //@ts-ignore
            curveType,
            newCombo: this.newCombo
        }
    }

    #overriddenPath = shallowRef<SliderPath>()

    private updateOverriddenPath() {
        if (this.overrides.controlPoints) {
            if (!this.#overriddenPath.value)
                this.#overriddenPath.value = new SliderPath()

            const p = this.#overriddenPath.value!

            p.controlPoints.value = this.overrides.controlPoints
            p.expectedLength = this.overrides.expectedLength ?? this.path.expectedLength
            p.start = this.path.start
            p.end = this.path.end
            p.calculatePath()
        } else if (this.#overriddenPath.value) {
            this.#overriddenPath.value = undefined
        }
    }

    get overriddenControlPoints() {
        if (this.overrides.controlPoints) {
            return this.overrides.controlPoints
        }
        return this.path.controlPoints.value
    }

    get overriddenPath() {
        if (this.#overriddenPath.value) {
            if (this.#overriddenPath.value.dirty)
                this.#overriddenPath.value.calculatePath()
            return this.#overriddenPath.value
        }
        if (this.path.dirty)
            this.path.calculatePath()
        return this.path
    }

    get endPosition() {
        if (this.repeatCount % 2 == 0)
            return this.position
        return this.path.endPosition
    }

    get overriddenEndPosition() {
        if (this.repeatCount % 2 == 0)
            return this.overriddenPosition

        if (this.#overriddenPath.value)
            return this.#overriddenPath.value!.endPosition
        return this.endPosition
    }

    applyOverrides(overrides: Record<string, any>, animated: boolean) {
        super.applyOverrides(overrides, animated);

        if (animated) {

            if (overrides.expectedLength) {
                this.overrides.expectedLength = overrides.expectedLength
            }

            if (overrides.controlPoints) {
                if (!this.overrides.controlPoints)
                    this.overrides.controlPoints = this.path.controlPoints.value.map(it => it.clone())

                if (this.overrides.controlPoints!.length === overrides.controlPoints.length) {
                    for (let i = 0; i < this.overrides.controlPoints.length; i++) {
                        this.overrides.controlPoints[i].kind = overrides.controlPoints[i].kind
                        gsap.to(this.overrides.controlPoints[i].position, {
                            x: overrides.controlPoints[i].position.x,
                            y: overrides.controlPoints[i].position.y,
                            duration: 0.2
                        })
                    }
                } else {
                    if (overrides.controlPoints) {
                        this.overrides.controlPoints = overrides.controlPoints.map((it: any) => new SliderControlPoint(
                            Vec2.from(it.position),
                            it.kind
                        ))
                    }
                }
                this.updateOverriddenPath()
            }
        } else {
            if (overrides.path) {
                this.#overriddenPath.value = overrides.path
                this.#overriddenPath.value!.setSnakedRange(this.path.start, this.path.end, true)
                this.overrides.controlPoints = overrides.path.controlPoints
                this.overrides.expectedLength = overrides.path.expectedLength

            } else {
                if (overrides.expectedLength) {
                    this.overrides.expectedLength = overrides.expectedLength
                }
                if (overrides.controlPoints) {
                    this.overrides.controlPoints = overrides.controlPoints.map((it: any) => new SliderControlPoint(
                        Vec2.from(it.position),
                        it.kind
                    ))
                    this.updateOverriddenPath()
                }

            }

        }
    }

    get overriddenEndTime() {
        return this.time + this.overriddenSpanDuration * this.repeatCount
    }

    get overriddenSpanDuration() {
        if (this.overrides.expectedLength) {
            return this.overrides.expectedLength * this.velocity
        }
        return this.spanDuration
    }

    private setSnakedRange(start: number, end: number) {
        this.path.setSnakedRange(start, end)
        if (this.#overriddenPath.value) {
            this.#overriddenPath.value.setSnakedRange(start, end)
        }
    }
}


interface SliderOverrides extends HitObjectOverrides {
    controlPoints: SliderControlPoint[] | null
    expectedLength: number | null
}
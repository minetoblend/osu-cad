import {HitObject, HitObjectOverrides} from "@/editor/hitobject/index";
import {SliderControlPoint, SliderPath} from "@/editor/hitobject/sliderPath";
import {Vec2} from "@/util/math";
import {EditorContext} from "@/editor";
import {BeatmapState} from "@/editor/state/beatmap";
import {animate} from "@/util/animation";
import {ref, shallowRef} from "vue";
import gsap from 'gsap'
import {Serialized} from 'osucad-gameserver'

export class Slider extends HitObject<SliderOverrides> {

    path = new SliderPath()
    // repeatCount = 1
    //spanDuration = 0
    velocity = 1
    sliderBallProgress = 0
    #repeatCount = ref(1)
    #overriddenPath = shallowRef<SliderPath>()

    constructor() {
        super({
            position: null,
            selectedBy: null,
            time: null,
            controlPoints: null,
            expectedDistance: null,
            repeats: null,
            newCombo: null,
        });
    }

    get repeatCount() {
        return this.#repeatCount.value
    }

    set repeatCount(value: number) {
        this.#repeatCount.value = value
    }

    get spanDuration() {
        return this.path.expectedDistance * this.velocity
    }

    get duration() {
        return this.spanDuration * this.repeatCount
    }

    get endTime() {
        return this.time + this.duration
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

    get overriddenEndTime() {
        return this.time + this.overriddenSpanDuration * this.repeatCount
    }

    get overriddenSpanDuration() {
        if (this.overrides.expectedDistance) {
            return this.overrides.expectedDistance * this.velocity
        }
        return this.spanDuration
    }

    updateFrom(hitObject: Serialized.HitObject) {
        super.updateFrom(hitObject)

        if (hitObject.data.type === 'slider') {


            const sliderData = hitObject.data

            this.path.controlPoints.value.splice(0)
            this.path.controlPoints.value.push(...sliderData.controlPoints.map(SliderControlPoint.deserialize))
            this.path.expectedDistance = sliderData.expectedDistance
            this.repeatCount = sliderData.repeats
            this.path.calculatePath()
        }

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
        this.overrides.expectedDistance = null
    }

    serialized(overrides?: Partial<SliderOverrides>): Serialized.HitObject {

        return {
            id: this.id,
            startTime: overrides?.time ?? this.time,
            selectedBy: this.selectedBy.value,
            position: overrides?.position?.rounded ?? this.position.rounded,
            newCombo: overrides?.newCombo ?? this.newCombo,
            data: {
                type: "slider",
                expectedDistance: overrides?.expectedDistance ?? this.path.expectedDistance,
                controlPoints: overrides?.controlPoints?.map(t => t.serialize()) ?? this.path.controlPoints.value.map(t => t.serialize()),
                repeats: overrides?.repeats ?? this.repeatCount,
            },
        };
    }

    applyOverrides(overrides: Record<string, any>, animated: boolean) {
        super.applyOverrides(overrides, animated);

        if (animated) {

            if (overrides.expectedDistance) {
                this.overrides.expectedDistance = overrides.expectedDistance
            }

            if (overrides.controlPoints) {
                if (!this.overrides.controlPoints)
                    this.overrides.controlPoints = this.path.controlPoints.value.map(it => it.clone())

                if (this.overrides.controlPoints!.length === overrides.controlPoints.length) {
                    for (let i = 0; i < this.overrides.controlPoints.length; i++) {
                        const deserialized = SliderControlPoint.deserialize(overrides.controlPoints[i])
                        this.overrides.controlPoints[i].kind = deserialized.kind
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
                this.overrides.expectedDistance = overrides.path.expectedDistance

            } else {
                if (overrides.expectedDistance) {
                    this.overrides.expectedDistance = overrides.expectedDistance
                }
                if (overrides.controlPoints) {
                    this.overrides.controlPoints = overrides.controlPoints.map(SliderControlPoint.deserialize)
                    this.updateOverriddenPath()
                }

            }

        }
    }

    private updateOverriddenPath() {
        if (this.overrides.controlPoints) {
            if (!this.#overriddenPath.value)
                this.#overriddenPath.value = new SliderPath()

            const p = this.#overriddenPath.value!

            p.controlPoints.value = this.overrides.controlPoints
            p.expectedDistance = this.overrides.expectedDistance ?? this.path.expectedDistance
            p.start = this.path.start
            p.end = this.path.end
            p.calculatePath()
        } else if (this.#overriddenPath.value) {
            this.#overriddenPath.value = undefined
        }
    }

    private setSnakedRange(start: number, end: number) {
        this.path.setSnakedRange(start, end)
        if (this.#overriddenPath.value) {
            this.#overriddenPath.value.setSnakedRange(start, end)
        }
    }


}


export interface SliderOverrides extends HitObjectOverrides {
    controlPoints: SliderControlPoint[] | null
    expectedDistance: number | null
    repeats: number | null
}
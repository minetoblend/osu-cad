import {Vec2} from "@/util/math";
import {reactive, ref, UnwrapNestedRefs} from "vue";
import {BeatmapState} from "@/editor/state/beatmap";
import {EditorContext} from "@/editor";
import {DisposableObject} from "@/util/disposable";
import gsap from 'gsap'
import {Serialized} from 'osucad-gameserver'

export abstract class HitObject<Overrides extends HitObjectOverrides = HitObjectOverrides> extends DisposableObject {
    id!: number

    readonly #time = ref(0)
    readonly #position = ref(Vec2.zero())
    readonly #newCombo = ref(false)

    readonly selectedBy = ref<number | null>(null)

    comboNumber = ref(0)
    comboIndex = ref(0)
    comboOffset = ref(0)

    destroyed = false

    constructor(defaultOverrides: Overrides) {
        super()
        this.overrides = reactive(defaultOverrides)
    }

    clearOverrides() {
        this.killTweens()
        this.overrides.time = null
        this.overrides.position = null
        this.overrides.selectedBy = null
    }

    readonly overrides: UnwrapNestedRefs<Overrides>

    get time() {
        return this.#time.value
    }

    set time(value: number) {
        this.#time.value = value
    }

    get newCombo() {
        return this.#newCombo.value
    }

    set newCombo(value) {
        this.#newCombo.value = value
    }

    get overriddenTime() {
        if (this.overrides.time !== null)
            return this.overrides.time
        return this.time
    }

    get duration() {
        return this.endTime - this.time
    }

    get overriddenDuration() {
        return this.overriddenEndTime - this.overriddenTime
    }

    get endTime() {
        return this.time
    }

    get overriddenEndTime() {
        return this.endTime
    }

    get position() {
        return this.#position.value
    }

    set position(value) {
        this.#position.value = value
    }

    get endPosition() {
        return this.position
    }

    get overriddenEndPosition() {
        return this.overriddenPosition
    }

    updateFrom(serialized: Serialized.HitObject) {
        this.clearOverrides()
        this.id = serialized.id
        this.time = serialized.startTime
        this.selectedBy.value = serialized.selectedBy
        this.newCombo = serialized.newCombo
        this.position = Vec2.from(serialized.position!)
    }

    applyDefaults(state: BeatmapState, ctx: EditorContext) {

    }

    abstract serialized(overrides?: Partial<Overrides>): Serialized.HitObject

    tweens: gsap.core.Tween[] = []

    killTweens() {
        this.tweens.forEach(it => it.kill())
    }

    get overriddenPosition() {
        if (this.overrides.position)
            return this.overrides.position
        return this.position
    }

    applyOverrides(overrides: Record<string, any>, animated: boolean) {
        this.killTweens()
        if (animated) {
            if (overrides.time) {
                if (this.overrides.time === null) this.overrides.time = this.time
                this.tweens.push(gsap.to(this.overrides, {time: overrides.time, duration: 0.1}))
            }
            if (overrides.position) {
                if (this.overrides.position === null) this.overrides.position = this.position.clone()
                this.tweens.push(gsap.to(this.overrides.position, {
                    x: overrides.position.x,
                    y: overrides.position.y,
                    duration: 0.2
                }))
            }
        } else {
            if (overrides.time !== undefined)
                this.overrides.time = overrides.time
            if (overrides.position)
                this.overrides.position = Vec2.from(overrides.position)
        }
    }
}

export interface HitObjectOverrides {
    position: Vec2 | null
    time: number | null
    selectedBy: string | null
    newCombo: boolean | null
}

import {HitObject} from "@/objects/HitObject";
import {Timing} from "@/objects/Timing";
import {EditorDrawablePool} from "@/objects/EditorDrawablePool";
import {ResourceProvider} from "@/draw";
import {PIXI} from "@/pixi";
import {HitCircle} from "@/objects/HitCircle";
import {Vec2} from "@/util/math";
import {reactive, ref, watch} from "vue";
import {Difficulty} from "@/objects/Difficulty";

export class EditorContext {

    readonly timing = new Timing()

    private readonly _hitObjects: HitObject[] = []

    readonly drawablePool = new EditorDrawablePool(this)

    readonly difficulty = reactive<Difficulty>({
        healthDrain: 5,
        circleSize: 4,
        approachRate: 10,
        overallDifficulty: 8,
    })

    currentTime = ref(0)

    constructor(readonly app: PIXI.Application, readonly resourceProvider: ResourceProvider) {
        const ho = new HitCircle()
        ho.position = new Vec2(200, 150)
        ho.time = 1000
        this.addHitObject(ho)

        watch(this.difficulty, () => {
            this.drawablePool.updateAll()
        })
        watch(this.currentTime, (time, old) => this.onCurrentTimeUpdate(time, old))

        app.ticker.add((dt) => {
            this.currentTime.value = (this.currentTime.value + app.ticker.deltaMS) % 2000
        })
    }

    get hitObjects() {
        return this._hitObjects as ReadonlyArray<HitObject>
    }

    onHitObjectUpdate(hitObject: HitObject) {
        this.drawablePool.onHitObjectChanged(hitObject)
    }

    onCurrentTimeUpdate(time: number, oldTime: number) {
        this.drawablePool.onTimeChanged(time, oldTime)
    }

    addHitObject(hitObject: HitCircle) {
        hitObject.context = this
        this._hitObjects.push(hitObject)
        this.drawablePool.onHitObjectChanged(hitObject)
    }
}
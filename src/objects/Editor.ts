import {HitObject} from "@/objects/HitObject";
import {Timing} from "@/objects/Timing";
import {EditorDrawablePool} from "@/objects/EditorDrawablePool";
import {ResourceProvider} from "@/draw";
import {PIXI} from "@/pixi";

export class EditorContext {

    readonly timing = new Timing()

    private readonly _hitObjects: HitObject[] = []

    readonly drawablePool = new EditorDrawablePool(this)

    currentTime: number = 0

    constructor(readonly app: PIXI.Application, readonly resourceProvider: ResourceProvider) {
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
}
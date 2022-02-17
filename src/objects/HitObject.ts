import {Vec2} from "@/util/math";
import {EditorContext} from "@/objects/Editor";
import {v4 as uuid} from 'uuid'
import {difficultyRange} from "@/util/difficulty";

const PREEMPT_MIN = 450

export class HitObject {
    position: Vec2 = new Vec2()
    time: number = 0
    context?: EditorContext
    uuid: string = uuid()


    private onUpdate() {
        this.context?.onHitObjectUpdate(this)
    }

    get timeRelativeToCurrentTime() {
        return this.context!.currentTime.value - this.time
    }

    get timePreemt() {
        return difficultyRange(this.context!.difficulty.approachRate, 1800, 1200, PREEMPT_MIN)
    }

    get timeFadeIn() {
        return 400 * Math.min(1, this.timePreemt / PREEMPT_MIN)
    }
}
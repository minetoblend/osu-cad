import {Vec2} from "@/util/math";
import {EditorContext} from "@/objects/Editor";
import {v4 as uuid} from 'uuid'

export class HitObject {
    position: Vec2 = new Vec2()
    time: number = 0
    context?: EditorContext
    uuid: string = uuid()


    private onUpdate() {
        this.context?.onHitObjectUpdate(this)
    }

}
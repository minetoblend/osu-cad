import {DragEvent} from "@/util/drag";
import {Vec2} from "@/util/math";

export abstract class DragOperation {


    abstract commit(evt: DragEvent): void

}

export interface DragOperation {
    onDrag?(evt: DragEvent): boolean

    onMouseMove?(mousePos: Vec2): boolean
}
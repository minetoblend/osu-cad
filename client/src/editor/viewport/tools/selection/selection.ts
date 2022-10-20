import {Container, IDestroyOptions} from "pixi.js";
import {HitObject} from "@/editor/hitobject";
import {Lifetime} from "@/util/disposable";
import {Vec2} from "@/util/math";
import {DragEvent} from "@/util/drag";
import {ViewportTool} from "@/editor/viewport/tools";

export class HitObjectSelection<T extends HitObject = HitObject> extends Container {

    readonly lifetime = new Lifetime()

    constructor(readonly hitObject: T, readonly tool: ViewportTool) {
        super();
    }

    destroy(_options?: IDestroyOptions | boolean) {
        super.destroy(_options);
        this.lifetime.dispose()
    }


}

export interface HitObjectSelection {
    onMouseDown?(evt: DragEvent): boolean

    onMouseUp?(evt: DragEvent): boolean

    onMouseMove?(mousePos: Vec2): void

    onDragStart?(evt: DragEvent): boolean

    onDrag?(evt: DragEvent): boolean

    onDragEnd?(evt: DragEvent): boolean

    onClick?(evt: DragEvent): boolean

    onKeyDown?(evt: KeyboardEvent): boolean

}
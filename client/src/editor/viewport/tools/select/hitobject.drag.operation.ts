import {DragOperation} from "@/editor/viewport/tools/operation";
import {ViewportTool} from "@/editor/viewport/tools";
import {Vec2} from "@/util/math";
import {DragEvent} from "@/util/drag";
import {HitObject} from "@/editor/hitobject";
import {ClientOpCode} from "@common/opcodes";
import {Slider} from "@/editor/hitobject/slider";
import {SliderControlPoint} from "@/editor/hitobject/sliderPath";

export class HitObjectDragOperation extends DragOperation {

    endOffset: Vec2

    constructor(readonly tool: ViewportTool, readonly startPosition: Vec2) {
        super();
        this.endOffset = Vec2.zero()
    }

    get selection() {
        return this.tool.selection
    }

    createOverrides(hitObject: HitObject, offset: Vec2) {
        const overrides: any = {
            position: hitObject.position.add(offset)
        }

        if (hitObject instanceof Slider) {
            overrides.controlPoints = hitObject.path.controlPoints.value.map(it =>
                new SliderControlPoint(it.position.add(offset), it.kind)
            )
        }


        return overrides
    }


    onDrag(evt: DragEvent): boolean {
        this.tool.sendOperationCommands(this.selection.map(hitObject => {
            const overrides = this.createOverrides(hitObject, evt.total)
            hitObject.applyOverrides(overrides, false)

            return [ClientOpCode.HitObjectOverride, {id: hitObject.id, overrides}]
        }))

        this.endOffset = evt.total
        return false;
    }

    commit() {
        this.selection.forEach(hitObject => {
            const serialized = hitObject.serialized()
            const overrides = this.createOverrides(hitObject, this.endOffset)
            this.tool.sendMessage(ClientOpCode.UpdateHitObject, {
                ...serialized,
                ...overrides,
            })
        })
    }

}
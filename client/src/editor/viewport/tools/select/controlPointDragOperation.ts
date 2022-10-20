import {DragOperation} from "@/editor/viewport/tools/operation";
import {DragEvent} from "@/util/drag";
import {ViewportTool} from "@/editor/viewport/tools";
import {Slider} from "@/editor/hitobject/slider";
import {SliderControlPoint, SliderPath} from "@/editor/hitobject/sliderPath";
import {ClientOpCode} from "@common/opcodes";

export class ControlPointDragOperation extends DragOperation {

    constructor(readonly tool: ViewportTool, readonly hitObject: Slider, readonly controlPointIndex: any) {
        super();

        console.log('drag')
    }

    createOverrides(evt: DragEvent) {
        const controlPoints = this.hitObject.path.controlPoints.value.map(it => it.clone())

        if (this.controlPointIndex === 0) {
            const draggedControlPoint = controlPoints[this.controlPointIndex]
            draggedControlPoint.position = draggedControlPoint.position.add(evt.total)
            return {
                path: this.createResnappedPath(controlPoints),
                position: this.hitObject.position.add(evt.total)
            }
        } else {
            const draggedControlPoint = controlPoints[this.controlPointIndex]
            draggedControlPoint.position = draggedControlPoint.position.add(evt.total)
            return {
                path: this.createResnappedPath(controlPoints),
                position: this.hitObject.position
            }
        }
    }

    onDrag(evt: DragEvent): boolean {
        const {path, position} = this.createOverrides(evt)

        this.hitObject.applyOverrides({path, position}, false)

        this.tool.sendOperationCommand(ClientOpCode.HitObjectOverride, {
            id: this.hitObject.id,
            overrides: {
                controlPoints: path.controlPoints.value,
                expectedLength: path.expectedLength,
                position
            }
        })

        return false;
    }

    commit(evt: DragEvent): void {
        const {path, position} = this.createOverrides(evt)

        const serialized = this.hitObject.serialized()
        serialized.controlPoints = path.controlPoints.value
        serialized.pixelLength = path.expectedLength
        serialized.position = position

        this.tool.sendMessage(ClientOpCode.UpdateHitObject, serialized)
    }


    createResnappedPath(controlPoints: SliderControlPoint[]) {
        const path = new SliderPath()
        path.controlPoints.value = controlPoints
        path.calculatePath(false)

        const length = path.calculatedPath.totalLength

        const overrides = this.tool.beatmap.timing.getTimingPointAt(this.hitObject.time, false)!

        const sv = this.tool.beatmap.difficulty.sliderMultiplier.value * (overrides?.sv ?? 1.0)

        const snapSize = 0.25 * 100 * sv

        path.expectedLength = Math.floor(length / snapSize) * snapSize
        path.setSnakedRange(path.start, path.end, true)
        path.fullPath.value = path.getRange(0, 1)

        return path
    }

}
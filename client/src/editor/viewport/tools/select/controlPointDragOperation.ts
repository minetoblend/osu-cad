import {DragOperation} from "@/editor/viewport/tools/operation";
import {DragEvent} from "@/util/drag";
import {ViewportTool} from "@/editor/viewport/tools";
import {Slider} from "@/editor/hitobject/slider";
import {SliderControlPoint, SliderPath} from "@/editor/hitobject/sliderPath";
import {defaultOverrides} from "@/editor/hitobject/overrides";

export class ControlPointDragOperation extends DragOperation {

    constructor(readonly tool: ViewportTool, readonly hitObject: Slider, readonly controlPointIndex: any) {
        super();
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

        this.tool.sendOperationCommand('setHitObjectOverrides', {
            id: this.hitObject.id,
            overrides: {
                ...defaultOverrides(),
                controlPoints: path.controlPoints.value.map(t => t.serialize()),
                expectedDistance: path.expectedDistance,
                position
            }
        })

        return false;
    }

    commit(evt: DragEvent): void {
        const {path, position} = this.createOverrides(evt)

        console.log(
            this.hitObject.serialized({
                controlPoints: path.controlPoints.value,
                expectedDistance: path.expectedDistance,
                position
            })
        )

        this.tool.sendMessage('updateHitObject', this.hitObject.serialized({
            controlPoints: path.controlPoints.value,
            expectedDistance: path.expectedDistance,
            position
        }))
    }


    createResnappedPath(controlPoints: SliderControlPoint[]) {
        const path = new SliderPath()
        path.controlPoints.value = controlPoints
        path.calculatePath(false)

        const length = path.calculatedPath.totalLength

        const overrides = this.tool.beatmap.timing.getTimingPointAt(this.hitObject.time, false)!

        const sv = this.tool.beatmap.difficulty.sliderMultiplier.value * (overrides?.sv ?? 1.0)

        const snapSize = 0.25 * 100 * sv

        path.expectedDistance = Math.floor(length / snapSize) * snapSize
        path.setSnakedRange(path.start, path.end, true)
        path.fullPath.value = path.getRange(0, 1)

        return path
    }

}
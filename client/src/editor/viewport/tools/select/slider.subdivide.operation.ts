import {DragOperation} from "@/editor/viewport/tools/operation";
import {DragEvent} from "@/util/drag";
import {ViewportTool} from "@/editor/viewport/tools";
import {Slider} from "@/editor/hitobject/slider";
import {SliderControlPoint, SliderControlPointType, SliderPath} from "@/editor/hitobject/sliderPath";
import {defaultOverrides} from "@/editor/hitobject/overrides";

export class SliderSubdivideOperation extends DragOperation {
    constructor(readonly tool: ViewportTool, readonly hitObject: Slider, readonly lineIndex: number) {
        super();
    }

    createPath(evt: DragEvent) {
        const controlPoints = this.hitObject.path.controlPoints.value.map(it => it.clone())
        const p = new SliderControlPoint(evt.current, SliderControlPointType.None)
        controlPoints.splice(this.lineIndex, 0, p)
        return this.createResnappedPath(controlPoints)
    }

    onDrag(evt: DragEvent): boolean {

        const path = this.createPath(evt)

        this.hitObject.applyOverrides({path}, false)

        this.tool.sendOperationCommand('setHitObjectOverrides', {
            id: this.hitObject.id,
            overrides: {
                ...defaultOverrides(),
                controlPoints: path.controlPoints.value.map(t => t.serialize()),
                expectedDistance: path.expectedDistance
            }
        })

        return false;
    }

    commit(evt: DragEvent): void {
        const path = this.createPath(evt)

        this.tool.sendMessage('updateHitObject',
            this.hitObject.serialized({
                controlPoints: path.controlPoints.value,
                expectedDistance: path.expectedDistance,
            })
        )
    }

    createResnappedPath(controlPoints
                            :
                            SliderControlPoint[]
    ) {
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
import {SliderSelection} from "@/editor/viewport/tools/selection/slider.selection";
import {Slider} from "@/editor/hitobject/slider";
import {ViewportTool} from "@/editor/viewport/tools";
import {DropdownDividerOption, DropdownOption} from "naive-ui";
import {Vec2} from "@/util/math";
import {SliderControlPointType} from "@common/types";
import {ClientOpCode} from "@common/opcodes";
import {SliderControlPoint, SliderPath} from "@/editor/hitobject/sliderPath";

export class SliderSelectionUtil {

    constructor(readonly selection: SliderSelection, readonly hitObject: Slider, readonly tool: ViewportTool) {

    }

    getControlPointDropdownOptions(index: number) {
        const options: (DropdownOption | DropdownDividerOption)[] = [
            {
                key: 'type:linear',
                label: 'Linear'
            },
            {
                key: 'type:bezier',
                label: 'Bezier'
            },
            {
                key: 'type:circle',
                label: 'Circular'
            },
            {type: 'type:divider'},
            {key: 'delete', label: 'Delete'}
        ]
        if (index > 0)
            options.unshift({
                key: 'inherit',
                label: 'Inherit'
            })
        return options
    }

    showControlPointDropdown(index: number, where: Vec2) {
        this.tool.showContextMenu(this.getControlPointDropdownOptions(index), where, value => {

            let indices = [index]

            if (this.selection.selectedControlPoints.has(index))
                indices = [...this.selection.selectedControlPoints]

            if (value.startsWith('type:')) {
                let kind = SliderControlPointType.None;
                switch (value) {
                    case 'type:inherit':
                        kind = SliderControlPointType.None
                        break;
                    case 'type:linear':
                        kind = SliderControlPointType.Linear
                        break;
                    case 'type:bezier':
                        kind = SliderControlPointType.Bezier
                        break;
                    case 'type:circle':
                        kind = SliderControlPointType.Circle
                        break;
                }

                this.setControlPointKind(indices, kind)
            }

            if (value === 'delete') {
                this.deleteControlPoints(indices)
            }
        })
    }

    deleteControlPoints(indices: number[]) {
        const shouldDelete = new Set(indices)

        const serialized = this.hitObject.serialized()
        const controlPoints = this.hitObject.path.controlPoints.value.filter((_, index) => !shouldDelete.has(index))

        serialized.controlPoints = controlPoints

        this.selection.selectedControlPoints.clear()

        this.tool.sendMessage(ClientOpCode.UpdateHitObject, serialized)
        return true

    }

    setControlPointKind(indices: number[], kind: SliderControlPointType) {
        const controlPoints = this.hitObject.path.controlPoints.value.map(it => it.clone())
        indices.forEach(index => {
            const controlPoint = controlPoints[index]
            controlPoint.kind = kind
        })

        const path = this.createResnappedPath(controlPoints)

        const serialized = this.hitObject.serialized()
        serialized.controlPoints = controlPoints
        serialized.pixelLength = path.expectedLength

        this.hitObject.applyOverrides({
            path
        }, false)

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
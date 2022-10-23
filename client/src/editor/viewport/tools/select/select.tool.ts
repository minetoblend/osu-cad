import {ViewportTool} from "@/editor/viewport/tools";
import {DragEvent} from "@/util/drag";
import {Bounds, Container} from "pixi.js";
import {Vec2} from "@/util/math";
import {PathVisualizer} from "@/editor/viewport/tools/path.visualizer";
import {HitObjectDragOperation} from "@/editor/viewport/tools/select/hitobject.drag.operation";
import {ControlPointDragOperation} from "@/editor/viewport/tools/select/controlPointDragOperation";
import {SliderControlPointType} from "@common/types";
import {Slider} from "@/editor/hitobject/slider";
import {SliderSubdivideOperation} from "@/editor/viewport/tools/select/slider.subdivide.operation";
import {createResnappedPath} from "@/editor/viewport/tools/util";
import {DropdownDividerOption, DropdownOption} from "naive-ui";
import {RotateOperation} from "@/editor/viewport/tools/select/rotate.operation";

export class SelectTool extends ViewportTool {

    overlayContainer = new Container()

    readonly pathVisualizer = new PathVisualizer()

    constructor() {
        super();
        this.overlayContainer.addChild(this.pathVisualizer)
    }

    updatePathVisualizer(mousePos: Vec2) {
        const selection = this.selection
        if (selection.length === 1 && selection[0] instanceof Slider) {
            this.pathVisualizer.hitObject = selection[0] as Slider
        } else {
            this.pathVisualizer.hitObject = this.getSlidersAt(mousePos, true).pop()
        }
        this.pathVisualizer.onMouseMove(mousePos)
    }

    onSelectionChanged() {
        this.updatePathVisualizer(this.lastMousePos)
    }

    lastMousePos = Vec2.zero()

    onMouseMove(mousePos: Vec2) {
        this.lastMousePos = mousePos
        this.updatePathVisualizer(this.lastMousePos)
    }

    onMouseDown(evt: DragEvent) {
        if (this.pathVisualizer.hoveredControlPoint !== undefined) {
            if (this.onControlPointMouseDown(this.pathVisualizer.hoveredControlPoint, evt)) {
                return;
            }
            return;
        }

        if (evt.leftMouseButton) {

            const selection = this.selection

            const candidates = this.getHitObjectsAt(evt.current, true)
            const candidate = candidates[candidates.length - 1]

            if (evt.ctrlKey && selection.length === 1 &&
                selection[0] instanceof Slider &&
                this.pathVisualizer.closestLine.value !== undefined &&
                (!candidate || !candidates.some(h => h !== selection[0]))
            ) {
                const index = this.pathVisualizer.closestLine.value

                this.beginMouseOperation(new SliderSubdivideOperation(this, selection[0] as Slider, index))
                return;
            }

            if (candidate) {
                if (evt.ctrlKey) {
                    if (this.selection.includes(candidate))
                        this.deselect(candidate)
                    else
                        this.addToSelection(candidate)
                } else if (!candidates.some(hitObject => selection.includes(hitObject))) {
                    this.select(candidate)
                }
            } else if (!evt.ctrlKey)
                this.deselectAll()
        }
    }

    showControlPointDropdown(hitObject: Slider, index: number, where: Vec2) {
        this.showContextMenu(this.getControlPointDropdownOptions(index), where, value => {

            let indices = [index]

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

                this.setControlPointKind(hitObject, indices, kind)
            }

            if (value === 'delete') {
                this.deleteControlPoints(hitObject, indices)
            }
        })
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
                key: 'type:inherit',
                label: 'Inherit'
            })
        return options
    }

    deleteControlPoints(hitObject: Slider, indices: number[]) {
        const shouldDelete = new Set(indices)

        const controlPoints = hitObject.path.controlPoints.value.filter((_, index) => !shouldDelete.has(index))

        this.sendMessage('updateHitObject', {hitObject: hitObject.serialized({controlPoints})})
        return true

    }

    setControlPointKind(hitObject: Slider, indices: number[], kind: SliderControlPointType) {
        const controlPoints = hitObject.path.controlPoints.value.map(it => it.clone())
        indices.forEach(index => {
            const controlPoint = controlPoints[index]
            controlPoint.kind = kind
        })

        const path = createResnappedPath(controlPoints, hitObject, this.ctx)


        hitObject.applyOverrides({
            path
        }, false)

        this.sendMessage('updateHitObject', {
            hitObject: hitObject.serialized({
                controlPoints,
                expectedDistance: path.expectedDistance
            })
        })
    }

    onDragStart(evt: DragEvent) {
        if (this.pathVisualizer.hoveredControlPoint !== undefined) {
            this.beginMouseOperation(new ControlPointDragOperation(this, this.pathVisualizer.hitObject!, this.pathVisualizer.hoveredControlPoint))
            return
        }

        if (evt.leftMouseButton) {
            const candidates = this.getHitObjectsAt(evt.current)
            const candidate = candidates[candidates.length - 1]

            if (evt.ctrlKey) {
                if (candidate && !this.selection.includes(candidate))
                    this.addToSelection(candidate)
            } else {
                if (candidate && !candidates.some(hitObject => this.selection.includes(hitObject)))
                    this.select(candidate)
            }

            this.beginMouseOperation(new HitObjectDragOperation(this, evt.start))
        }
    }

    private onControlPointMouseDown(index: number, evt: DragEvent) {
        const hitObject = this.pathVisualizer.hitObject!

        if (evt.leftMouseButton && evt.ctrlKey) {

            const controlPoints = hitObject.path.controlPoints.value.map(it => it.clone())
            controlPoints[index].kind = (controlPoints[index].kind + 1) % (SliderControlPointType.Circle + 1)
            if (index === 0 && controlPoints[index].kind === SliderControlPointType.None)
                controlPoints[index].kind++

            const path = createResnappedPath(controlPoints, hitObject, this.ctx)

            hitObject.applyOverrides({path}, false)

            this.sendMessage('updateHitObject', {
                hitObject: hitObject.serialized({
                    controlPoints: path.controlPoints.value,
                    expectedDistance: path.expectedDistance
                })
            })
            return true
        }

        if (evt.rightMouseButton) {
            if (evt.ctrlKey) {
                const controlPoints = hitObject.path.controlPoints.value.map(it => it.clone())
                controlPoints.splice(index, 1)
                const path = createResnappedPath(controlPoints, hitObject, this.ctx)

                hitObject.applyOverrides({path}, false)



                this.sendMessage('updateHitObject', {
                    hitObject: hitObject.serialized({
                        controlPoints,
                        expectedDistance: path.expectedDistance
                    })
                })

            } else {
                this.showControlPointDropdown(hitObject, index, new Vec2(evt.evt.clientX, evt.evt.clientY))
            }
        }


        return false
    }

    onShortcut(evt: CustomEvent) {
        if (this.dragOperation)
            return

        if (evt.detail === 'r') {
            evt.preventDefault()
            const bounds = new Bounds()
            this.selection.forEach(it => {
                bounds.addPoint(it.position)
                bounds.addPoint(it.endPosition)
            })
            if (bounds.isEmpty())
                return;
            const center = new Vec2(
                (bounds.minX + bounds.maxX) / 2,
                (bounds.minY + bounds.maxY) / 2
            )
            this.beginMouseOperation(new RotateOperation(this, center, this.lastMousePos))
        }
    }
}

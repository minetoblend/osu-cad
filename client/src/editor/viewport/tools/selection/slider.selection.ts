import {HitObjectSelection} from "@/editor/viewport/tools/selection/selection";
import {Slider} from "@/editor/hitobject/slider";
import {ref, shallowReactive, watchEffect} from "vue";
import {Graphics} from "pixi.js";
import {SliderControlPoint, SliderPath} from "@/editor/hitobject/sliderPath";
import {Vec2} from "@/util/math";
import {DragEvent} from "@/util/drag";
import {ViewportTool} from "@/editor/viewport/tools";
import {ClientOpCode} from "@common/opcodes";
import {SliderControlPointType} from "@common/types";
import {SliderSelectionUtil} from "@/editor/viewport/tools/selection/sliderSelectionUtil";
import {PathApproximator} from "@/editor/hitobject/pathApproximator";

export class SliderSelection extends HitObjectSelection<Slider> {
    constructor(hitObject: Slider, tool: ViewportTool, readonly createMode: boolean, readonly customControlPoints?: SliderControlPoint[]) {
        super(hitObject, tool);
        this.addChild(this.#graphics)
        this.lifetime.add(watchEffect(() => this.updateGraphics()))
        this.#util = new SliderSelectionUtil(this, hitObject, tool)
    }

    #util: SliderSelectionUtil;

    #graphics = new Graphics()

    readonly hovering = ref<number>()
    readonly selectedControlPoints = shallowReactive(new Set<number>())

    readonly hoveringLine = ref<number>()
    readonly selectedLines = shallowReactive(new Set<number>())

    readonly circlePreview = ref<{ center: Vec2, radius: number }>()

    get controlPoints() {
        if (this.createMode)
            return this.hitObject.overriddenControlPoints
        return this.hitObject.path.controlPoints.value
    }

    updateGraphics() {
        const g = this.#graphics

        g.clear()

        g.lineStyle({
            width: 1.5,
            color: 0xffffff
        })

        const controlPoints = this.hitObject.overriddenControlPoints

        const offset = this.hitObject.overriddenPosition.sub(this.hitObject.position)


        if (this.circlePreview.value) {
            g.lineStyle({
                color: 0x35a3fc,
                width: 1.5,
                alpha: 0.75
            })
            const numPoints = Math.floor(
                Math.min(this.circlePreview.value!.radius / 3, 256)
            )
            let step = Math.PI * 2 / numPoints

            const center = this.circlePreview.value!.center
            const radius = this.circlePreview.value!.radius

            for (let i = 0; i < numPoints; i++) {
                let angle = i * step
                let nextAngle = (i + 0.5) * step
                g.moveTo(center.x + Math.cos(angle) * radius, center.y + Math.sin(angle) * radius)
                g.lineTo(center.x + Math.cos(nextAngle) * radius, center.y + Math.sin(nextAngle) * radius)

            }
        }


        const startPos = controlPoints[0].position.add(offset)
        g.moveTo(startPos.x, startPos.y)

        let kind = controlPoints[0].kind

        for (let i = 1; i < controlPoints.length; i++) {
            const p = controlPoints[i].position.add(offset)
            let color = 0xffffff;
            let width = 1.5;

            switch (kind) {
                case SliderControlPointType.None:
                    color = 0xebd834;
                    break;

                case SliderControlPointType.Bezier:
                    color = 0xfc3599;
                    break;

                case SliderControlPointType.Linear:
                    color = 0x1eeb88;
                    break;


                case SliderControlPointType.Circle:
                    color = 0x35a3fc;
                    break;
            }

            if (controlPoints[i].kind !== SliderControlPointType.None) {
                kind = controlPoints[i].kind;
            }


            if (this.selectedLines.has(i)) {
                width = 2.5;
            } else if (this.hoveringLine.value === i) {
                width = 2.5;
            }

            g.lineStyle({width, color})

            if (this.createMode && i === this.controlPoints.length - 1 && this.controlPoints.length > 2) {
                const last = controlPoints[i - 1].position.add(offset)
                const distance = last.sub(p).length
                if (distance === 0)
                    break
                const dir = p.sub(last).normalized

                const step = 10
                let numP = Math.ceil(p.sub(last).length / step)
                for (let i = 0; i < numP; i++) {
                    const start = last.add(dir.mulF(i * step))
                    const end = start.add(dir.mulF(0.5 * step))

                    g.moveTo(start.x, start.y)
                    g.lineTo(end.x, end.y)
                }
            } else {
                g.lineTo(p.x, p.y)
            }

        }

        g.lineStyle()


        controlPoints.forEach((controlPoint, index) => {

            let radius = 6;
            let color = 0xdddddd;
            switch (controlPoint.kind) {
                case SliderControlPointType.None:
                    radius = 4;
                    break;

                case SliderControlPointType.Bezier:
                    color = 0xfc3599;
                    break;

                case SliderControlPointType.Linear:
                    color = 0x1eeb88;
                    break;


                case SliderControlPointType.Circle:
                    color = 0x35a3fc;
                    break;
            }

            const pos = controlPoint.position.add(offset)
            const isSelected = this.selectedControlPoints.has(index)

            if (!isSelected && this.hovering.value === index) {
                g.beginFill(color)
                g.drawCircle(pos.x, pos.y, radius + 3)
                g.endFill()
            } else if (isSelected) {
                g.beginFill(0xffffff)
                g.drawCircle(pos.x, pos.y, radius + 3)
                g.endFill()
            }

            g.beginFill(color)
            g.drawCircle(pos.x, pos.y, radius)
            g.endFill()

        })

    }

    onMouseMove(pos: Vec2) {
        let minDistance = Number.MAX_VALUE
        let minIndex = -1

        this.controlPoints.forEach((controlPoint, index) => {
            if (this.createMode && index === this.controlPoints.length - 1)
                return;

            const distance = pos.sub(controlPoint.position).lengthSquared
            if (distance < minDistance) {
                minDistance = distance
                minIndex = index
            }
        })

        if (minDistance < 15 * 15) {
            this.hovering.value = minIndex
            return;
        } else {
            this.hovering.value = undefined
        }


        function pDistance(p: Vec2, from: Vec2, to: Vec2) {


            const A = p.x - from.x; // position of point rel one end of line
            const B = p.y - from.y;
            const C = to.x - from.x; // vector along line
            const D = to.y - from.y;
            const E = -D; // orthogonal vector
            const F = C;

            const dot = A * E + B * F;
            const lenSq = E * E + F * F;

            return (dot * dot) / lenSq;
        }

        minDistance = Number.MAX_VALUE
        minIndex = -1

        let last = this.controlPoints[0].position
        for (let i = 1; i < this.controlPoints.length; i++) {
            const cur = this.controlPoints[i].position

            const distance = pDistance(pos, last, cur)
            if (distance < minDistance) {
                minIndex = i
                minDistance = distance
            }
            last = cur
        }

        if (minDistance < 25) {
            this.hoveringLine.value = minIndex
        } else {
            this.hoveringLine.value = undefined
        }

    }

    #dragCandidate = -1
    dragging = false

    onMouseDown(evt: DragEvent) {
        if (this.createMode && this.hovering.value === this.controlPoints.length - 1)
            return false;

        this.#dragCandidate = this.hovering.value ?? -1;

        return this.hovering.value !== undefined
    }

    onClick(evt: DragEvent): boolean {
        if (evt.leftMouseButton) {
            let candidate = this.hovering.value
            if (candidate !== undefined) {
                if (evt.ctrlKey) {
                    let kind = (this.controlPoints[candidate].kind + 1) % (SliderControlPointType.Circle + 1)
                    if (candidate === 0 && kind === SliderControlPointType.None)
                        kind++

                    this.#util.setControlPointKind([candidate], kind)
                } else if (evt.shiftKey) {
                    if (this.selectedControlPoints.has(candidate))
                        this.selectedControlPoints.delete(candidate)
                    else
                        this.selectedControlPoints.add(candidate)
                } else {
                    this.selectedControlPoints.clear()
                    this.selectedControlPoints.add(candidate)

                }
                this.selectedLines.clear()
                return true
            }

            if (this.hoveringLine.value) {
                if (evt.ctrlKey) {
                    const index = this.hoveringLine.value

                    const p = new SliderControlPoint(evt.current, SliderControlPointType.None)

                    const controlPoints = this.controlPoints.map(it => it.clone())
                    controlPoints.splice(index, 0, p)

                    const path = this.#util.createResnappedPath(controlPoints)

                    const serialized = this.hitObject.serialized()
                    serialized.controlPoints = controlPoints
                    serialized.pixelLength = path.expectedLength


                    this.tool.sendMessage(ClientOpCode.UpdateHitObject, serialized)

                } else if (evt.shiftKey) {
                    if (this.selectedLines.has(this.hoveringLine.value))
                        this.selectedLines.delete(this.hoveringLine.value)
                    else
                        this.selectedLines.add(this.hoveringLine.value)
                } else {
                    if (!this.selectedLines.has(this.hoveringLine.value)) {
                        this.selectedLines.clear()
                        this.selectedLines.add(this.hoveringLine.value)
                    }
                }
                this.selectedControlPoints.clear()

                return true;
            }
        }

        if (evt.rightMouseButton) {
            if (this.hovering.value !== undefined) {
                this.#util.showControlPointDropdown(this.hovering.value, new Vec2(evt.evt.clientX, evt.evt.clientY))
            }
        }

        return false
    }

    onDragStart(evt: DragEvent): boolean {
        if (evt.leftMouseButton) {

            let candidate = this.hovering.value
            if (candidate !== undefined) {
                this.dragging = true

                this.tool.startOperation()

                if (!this.selectedControlPoints.has(candidate)) {
                    if (!evt.shiftKey)
                        this.selectedControlPoints.clear()

                    this.selectedControlPoints.add(candidate)
                }
                this.selectedLines.clear()
                return true
            } else {

                if (this.hoveringLine.value && evt.ctrlKey) {
                    this.dragging = true

                    this.mode = 'subdivide'
                    this.selectedLines.clear()
                    this.selectedLines.add(this.hoveringLine.value)

                    this.tool.startOperation()

                    return true
                }

                this.selectedControlPoints.clear()
            }


        }
        return false
    }

    mode?: 'subdivide'

    subdividedPath?: SliderPath

    onDrag(evt: DragEvent): boolean {
        if (this.dragging) {

            if (!this.mode) {

                let {controlPoints, position, path} = this.createOverrides(evt, false);

                this.hitObject.applyOverrides({
                    position,
                    path,
                }, false)

                this.tool.sendOperationCommand(ClientOpCode.HitObjectOverride, {
                    id: this.hitObject.id,
                    overrides: {
                        controlPoints,
                        position,
                        expectedLength: path.expectedLength
                    }
                })
                this.circlePreview.value = undefined
                if (this.selectedControlPoints.size === 1) {

                    const selected = [...this.selectedControlPoints][0]


                    let kind = SliderControlPointType.None
                    let i = selected
                    while (kind !== SliderControlPointType.Circle && i >= 0) {
                        kind = controlPoints[i].kind
                        i--
                    }

                    if (kind === SliderControlPointType.Circle && selected - i < 4) {

                        const circleProps = PathApproximator.circularArcProperties(
                            controlPoints.slice(i + 1, i + 4).map(it => it.position)
                        )
                        if (circleProps) {
                            this.circlePreview.value = {
                                center: circleProps.centre.add(position.sub(this.hitObject.position)),
                                radius: circleProps.radius
                            }
                        }
                    }


                }

            } else if (this.mode === "subdivide") {
                const index = [...this.selectedLines][0]

                const p = new SliderControlPoint(evt.current, SliderControlPointType.None)

                const controlPoints = this.controlPoints.map(it => it.clone())
                controlPoints.splice(index, 0, p)

                const path = this.#util.createResnappedPath(controlPoints)

                this.hitObject.applyOverrides({
                    path
                }, false)

                this.tool.sendOperationCommand(ClientOpCode.HitObjectOverride, {
                    id: this.hitObject.id,
                    overrides: {
                        controlPoints,
                        expectedLength: path.expectedLength
                    }
                })


                this.subdividedPath = path
            }

            return true
        }
        return false
    }

    private createOverrides(evt: DragEvent, final: boolean) {
        const controlPoints = this.controlPoints.map(it => it.clone(false))
        let position = this.controlPoints[0].position

        let isDraggingStart = this.selectedControlPoints.has(0)

        if (isDraggingStart)
            position = position.add(evt.total)

        controlPoints.forEach((it, index) => {
            if (isDraggingStart && !final) {
                if (!this.selectedControlPoints.has(index))
                    it.position = it.position.sub(evt.total)
            } else {
                if (this.selectedControlPoints.has(index))
                    it.position = it.position.add(evt.total)
            }
        })

        const path = this.#util.createResnappedPath(controlPoints)

        return {controlPoints, position, path};
    }

    onDragEnd(evt: DragEvent): boolean {
        if (this.dragging) {
            this.reset()


            if (!this.mode) {
                this.tool.endOperation()

                const overrides = this.createOverrides(evt, true)

                const serialized = this.hitObject.serialized()
                serialized.position = overrides.position
                serialized.pixelLength = overrides.path.expectedLength
                serialized.controlPoints = overrides.controlPoints

                this.tool.sendMessage(ClientOpCode.UpdateHitObject, serialized)


                this.dragging = false
                return true
            } else if (this.mode === 'subdivide') {

                this.tool.endOperation()
                if (this.subdividedPath) {
                    const serialized = this.hitObject.serialized()
                    serialized.pixelLength = this.subdividedPath.expectedLength
                    serialized.controlPoints = this.subdividedPath.controlPoints.value

                    this.tool.sendMessage(ClientOpCode.UpdateHitObject, serialized)
                }

                this.dragging = false
                this.mode = undefined

                return true
            }
        }
        return false
    }

    reset() {
        this.circlePreview.value = undefined
    }

    onKeyDown(evt: KeyboardEvent): boolean {
        if (evt.key === 'Delete' && this.selectedControlPoints.size > 0) {
            this.#util.deleteControlPoints([...this.selectedControlPoints])
            return true
        }
        return false
    }
}

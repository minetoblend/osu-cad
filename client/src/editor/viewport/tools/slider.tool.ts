import {ViewportTool} from "@/editor/viewport/tools/index";
import {DragEvent} from "@/util/drag";
import {Container, Sprite, Texture} from "pixi.js";

import circlePiece from '@/assets/skin/hitcircleoverlay.png'
import {Vec2} from "@/util/math";
import {SliderControlPoint, SliderPath} from "@/editor/hitobject/sliderPath";
import {Slider} from "@/editor/hitobject/slider";
import {SliderControlPointType} from "@common/types";
import {nextTick, ref} from "vue";
import {PathVisualizer} from "@/editor/viewport/tools/path.visualizer";

export class SliderCreateTool extends ViewportTool {

    overlayContainer = new Container()
    private readonly pathVisualizer = new PathVisualizer()

    onClick(evt: DragEvent) {

        if (evt.rightMouseButton) {
            if (this.slider) {
               this.commit()
            } else
                this.manager.toolId = 'select'
        }
    }

    #cursor = new Sprite(Texture.from(circlePiece))
    #pathContainer = new Container()

    constructor() {
        super();
        this.#cursor.anchor.set(0.5)
        this.#cursor.scale.set(0.5)
    }

    onToolActivated() {
        this.overlayContainer.removeChildren()
        this.overlayContainer.addChild(this.#pathContainer)
        this.overlayContainer.addChild(this.#cursor)
        this.overlayContainer.addChild(this.pathVisualizer)
        this.#cursor.visible = true
    }



    onMouseMove(mousePos: Vec2) {
        this.#cursor.position.copyFrom(mousePos)
        if (this.currentPoint && this.controlPoints.value) {
            this.currentPoint.position = mousePos.clone()


            const path = new SliderPath()
            path.controlPoints.value = this.controlPoints.value!
            path.calculatePath(false)

            const length = path.calculatedPath.totalLength

            const overrides = this.beatmap.timing.getTimingPointAt(this.slider!.time, false)!

            const sv = this.beatmap.timing.baseSv * (overrides?.sv ?? 1.0)

            const snapSize = 0.25 * 100 * sv

            path.expectedDistance = Math.floor(length / snapSize) * snapSize
            path.setSnakedRange(path.start, path.end, true)
            path.fullPath.value = path.getRange(0, 1)

            this.slider!.applyOverrides({
                path
            }, false)


            this.sendOperationCommand(
                'setHitObjectOverrides',
                {
                    id: this.slider!.id,
                    overrides: {
                        controlPoints: {
                            controlPoints: path.controlPoints.value.map(it => it.clone()) as any
                        },
                        expectedDistance: path.expectedDistance,
                    }
                }
            )
        }


    }

    slider?: Slider
    controlPoints = ref<SliderControlPoint[]>()
    currentPoint?: SliderControlPoint
    lastPoint?: SliderControlPoint

    isCreating = false

    async onMouseDown(evt: DragEvent) {
        if (evt.leftMouseButton) {
            if (!this.slider && !this.isCreating) {
                this.isCreating = true

                const slider = new Slider()
                slider.time = this.ctx.currentTime

                slider.path.controlPoints.value.push(
                    new SliderControlPoint(evt.current, SliderControlPointType.Bezier),
                    new SliderControlPoint(evt.current.add(new Vec2(10, 10)), SliderControlPointType.None)
                )

                slider.position = evt.current

                const response = await this.ctx.sendMessageWithResponse('createHitObject', {
                    hitObject: slider.serialized()
                }) as any

                const id = response.id
                nextTick(() => {
                    this.startOperation()
                    this.#cursor.visible = false
                    this.slider = this.beatmap.hitobjects.findById(id)! as Slider

                    this.controlPoints.value = this.slider.path.controlPoints.value.map(it => it.clone())

                    this.currentPoint = this.controlPoints.value[this.controlPoints.value.length - 1]

                    this.lastPoint = this.controlPoints.value[0]

                    this.pathVisualizer.hitObject = this.slider

                    this.isCreating = false
                })
            } else if (this.slider) {
                if (this.lastPoint && evt.current.sub(this.lastPoint.position).lengthSquared < 10 * 10) {
                    this.lastPoint!.kind =
                        (this.lastPoint!.kind + 1) % (SliderControlPointType.Circle + 1)
                    this.updateCurrentSection()
                } else {
                    this.addControlPoint(evt.current)
                }
            }
        }
    }

    onToolDeactivated() {
        this.commit()
    }

    commit() {
        if(this.slider) {

            this.endOperation()
            this.#cursor.visible = true


            const serialized = this.slider.serialized(this.slider.overrides);

            this.sendMessage('updateHitObject', {hitObject: serialized})

            this.slider = undefined
            this.currentPoint = undefined
            this.lastPoint = undefined
            this.controlPoints.value = undefined
            this.#pathContainer.removeChildren()
        }
    }

    private addControlPoint(current: Vec2) {
        this.lastPoint = this.currentPoint
        this.currentPoint = new SliderControlPoint(current, SliderControlPointType.None)
        this.controlPoints.value!.push(this.currentPoint)
        this.updateCurrentSection()
        if (this.sectionLength === 3 && this.sectionStart) {
            this.sectionStart.kind = SliderControlPointType.Circle
        } else if (this.sectionLength && this.sectionLength > 3 && this.sectionStart?.kind === SliderControlPointType.Circle) {
            this.sectionStart.kind = SliderControlPointType.Bezier
        }

    }

    sectionStart?: SliderControlPoint
    sectionLength?: number

    private updateCurrentSection() {
        for (let i = this.controlPoints.value!.length - 1; i >= 0; i--) {
            const controlPoint = this.controlPoints.value![i]
            if (controlPoint.kind !== SliderControlPointType.None) {
                this.sectionStart = controlPoint
                this.sectionLength = this.controlPoints.value!.length - i
                return;
            }
        }
        this.sectionStart = this.controlPoints.value![0]
        this.sectionLength = this.controlPoints.value!.length
    }
}
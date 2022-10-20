import {ViewportTool} from "@/editor/viewport/tools/index";
import {DragEvent} from "@/util/drag";
import {ClientOpCode} from "@common/opcodes";
import {Slider} from "@/editor/hitobject/slider";
import {SerializedSlider} from "@common/types";
import {HitObject} from "@/editor/hitobject";
import {HitObjectSelection} from "@/editor/viewport/tools/selection/selection";
import {SliderSelection} from "@/editor/viewport/tools/selection/slider.selection";
import {Container} from "pixi.js";
import {Vec2} from "@/util/math";

export class SelectTool extends ViewportTool {

    overlayContainer = new Container()
    #selectionContainer = new Container()

    constructor() {
        super();

        this.overlayContainer.addChild(this.#selectionContainer)
    }


    onClick(evt: DragEvent) {
        if ([...this.#selectionWidgets.values()].some(t => t.onClick?.(evt)))
            return;


        const o = this.getHitObjectAt(evt.current)
        if (o) {
            if (evt.leftMouseButton) {
                if (evt.shiftKey) {
                    if (this.selection.includes(o))
                        this.deselect(o)
                    else
                        this.addToSelection(o)
                } else
                    this.select(o)
            }
        } else {
            if (evt.leftMouseButton)
                this.deselectAll()
        }
    }

    onDragStart(evt: DragEvent) {
        if ([...this.#selectionWidgets.values()].some(t => t.onDragStart?.(evt)))
            return;

        if (evt.leftMouseButton) {
            const objects = this.getHitObjectsAt(evt.current)

            if (objects.length === 0) return this.deselectAll();

            this.startOperation(async () => {
                if(!this.selection.some(it => objects.indexOf(it) >= 0)) {
                    if (evt.shiftKey)
                        await this.addToSelection(objects.pop()!)
                    else
                        await this.select(objects.pop()!)
                }
            }, 100)
        }
    }

    onDrag(evt: DragEvent) {
        if ([...this.#selectionWidgets.values()].some(t => t.onDrag?.(evt)))
            return;

        if (evt.leftMouseButton) {

            this.sendOperationCommands(this.selection.map(o => {
                const position = o.position.add(evt.total)
                o.overrides.position = position

                return [ClientOpCode.HitObjectOverride, {
                    id: o.id,
                    overrides: {
                        position
                    }
                }]
            }))

        }
    }

    onDragEnd(evt: DragEvent) {
        if ([...this.#selectionWidgets.values()].some(t => t.onDragEnd?.(evt)))
            return;

        this.endOperation()

        this.selection.forEach(o => {
            const position = o.position.add(evt.total)

            const serialized = o.serialized()
            serialized.position = position

            if (o instanceof Slider) {
                const t = serialized as SerializedSlider
                t.controlPoints = t.controlPoints.map(p => ({
                    position: {
                        x: p.position.x + evt.total.x,
                        y: p.position.y + evt.total.y,
                    },
                    kind: p.kind
                }))
            }

            this.sendMessage(ClientOpCode.UpdateHitObject, serialized)
        })
    }

    readonly #selectionWidgets = new Map<HitObject, HitObjectSelection>()

    onSelectionAdded(object: HitObject) {
        if (this.#selectionWidgets.has(object))
            return;

        if (object instanceof Slider) {
            const selection = new SliderSelection(object, this, false)
            this.#selectionWidgets.set(object, selection)
            this.#selectionContainer.addChild(selection)
        }
    }

    onSelectionRemoved(object: HitObject) {
        // console.log('selection removed', object)

        const selection = this.#selectionWidgets.get(object)
        if (selection) {
            selection.destroy({children: true})
            this.#selectionWidgets.delete(object)
        }
    }

    onToolActivated() {
        this.#selectionContainer.removeChildren()
        this.selection.forEach(it => this.onSelectionAdded(it))
    }

    onMouseMove(mousePos: Vec2) {
        this.#selectionWidgets.forEach(it => it.onMouseMove?.(mousePos))
    }

    onMouseDown(evt: DragEvent) {
        [...this.#selectionWidgets.values()].some(t => t.onMouseDown?.(evt))
    }

    onKeyDown(evt: KeyboardEvent): boolean {
        let preventDefault = false
        this.#selectionWidgets.forEach(it => {
            if (it.onKeyDown?.(evt))
                preventDefault = true
        })

        return preventDefault
    }
}

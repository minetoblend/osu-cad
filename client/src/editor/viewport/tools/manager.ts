import {ViewportTool} from "@/editor/viewport/tools/index";
import {SelectTool} from "@/editor/viewport/tools/select/select.tool";
import {Container} from "pixi.js";
import {Vec2} from "@/util/math";
import {drag} from "@/util/drag";
import {EditorContext} from "@/editor";
import {PlayfieldDrawable} from "@/editor/viewport/playfield";
import {shallowRef} from "vue";
import {DropdownOption} from "naive-ui";
import {SliderCreateTool} from "@/editor/viewport/tools/slider.tool";
import {CircleCreateTool} from "@/editor/viewport/tools/circle.tool";
import {getFlippedHitObject} from "@/editor/viewport/tools/util";
import {Slider} from "@/editor/hitobject/slider";
import {HitObject as HitObjectData} from "protocol/commands";

const tools: Record<string, ViewportTool> = {
    select: new SelectTool(),
    circle: new CircleCreateTool(),
    slider: new SliderCreateTool(),
}

export class ToolManager {

    constructor(readonly ctx: EditorContext, readonly playfield: PlayfieldDrawable) {


        this.#tool.value.ctx = this.ctx
        this.#tool.value.playfield = this.playfield
        this.#tool.value.beatmap = this.ctx.beatmap
        this.#tool.value.manager = this

        this.selectTool(tools.select, true)

        this.ctx.beatmap.hitobjects.onSelectionAdded.subscribe(o => {
            this.#tool.value.onSelectionAdded?.(o)
            this.#tool.value.onSelectionChanged?.(o, 'add')
        })
        this.ctx.beatmap.hitobjects.onSelectionRemoved.subscribe(o => {
            this.#tool.value.onSelectionRemoved?.(o)
            this.#tool.value.onSelectionChanged?.(o, 'remove')
        })

    }

    readonly toolOverlay = new Container()

    #toolId = shallowRef('select')
    #tool = shallowRef(tools.select!)

    get toolId() {
        return this.#toolId.value
    }

    set toolId(value) {
        this.#toolId.value = value
        this.selectTool(tools[value])
    }

    get tool() {
        return this.#tool.value
    }

    selectTool(tool: ViewportTool, force = false) {
        if (tool === this.#tool.value && !force)
            return

        this.#tool.value.onToolDeactivated?.()

        this.#tool.value = tool
        this.toolOverlay.removeChildren()

        tool.ctx = this.ctx
        tool.playfield = this.playfield
        tool.beatmap = this.ctx.beatmap
        tool.manager = this

        tool.onToolActivated?.()

        if (tool.overlayContainer) {
            this.toolOverlay.addChild(tool.overlayContainer)
        }
    }

    isMouseDown = 0

    handleMouseDown(evt: MouseEvent, offset: Vec2, scale: number) {

        drag(evt, {
            dragStartTolerance: 2,
            getPosition: pos => pos.sub(offset).divF(scale),
            onMouseDown: evt => {
                this.isMouseDown++
                if (this.tool.dragOperation)
                    return this.tool.commitDragOperation(evt)
                this.tool.onMouseDown?.(evt)
            },
            onDragStart: evt => {
                if (this.tool.dragOperation)
                    return;
                this.tool.onDragStart?.(evt)
            },
            onDrag: evt => {
                if (this.tool.dragOperation)
                    return this.tool.dragOperation.onDrag?.(evt)
                this.tool.onDrag?.(evt)
            },
            onDragEnd: evt => {
                this.isMouseDown--
                if (this.tool.dragOperation)
                    return this.tool.commitDragOperation(evt)

                this.tool.onDragEnd?.(evt)
            },
            onClick: evt => {
                this.isMouseDown--
                if (this.tool.dragOperation)
                    return this.tool.commitDragOperation(evt)

                this.tool.onClick?.(evt)
            },

        })
    }

    mousePos = Vec2.zero()

    handleShortcut(evt: CustomEvent) {


        if (this.tool.onShortcut) {
            this.tool.onShortcut(evt)
            if (evt.defaultPrevented)
                return;
        }


        if (evt.detail === 'q') {
            const selection = this.tool.selection
            selection.forEach(it => {
                this.tool.sendMessage('updateHitObject', {
                    hitObject: it.serialized({newCombo: !it.newCombo})
                })
            })
            evt.preventDefault()
        }

        if (evt.detail === 'delete') {
            this.tool.deleteHitObjects(...this.tool.selection)
            evt.preventDefault()
        }

        if (evt.detail === 'ctrl+a') {
            for (let i = 0; i < this.ctx.beatmap.hitobjects.hitObjects.length; i += 25) {

                this.ctx.sendMessage('selectHitObject', {
                    ids: this.ctx.beatmap.hitobjects.hitObjects
                        .slice(i, Math.min(i + 25, this.ctx.beatmap.hitobjects.hitObjects.length))
                        .map(it => it.id),
                    selected: true,
                    unique: false
                })
            }


            evt.preventDefault()
        }

        if (evt.detail === 'ctrl+h') {
            this.ctx.beatmap.hitobjects.selection.forEach(it => {
                const flipped = getFlippedHitObject(it, 'horizontal')
                this.ctx.sendMessage('updateHitObject', {hitObject: flipped})
            })
            evt.preventDefault()
        }

        if (evt.detail === 'ctrl+j') {
            this.ctx.beatmap.hitobjects.selection.forEach(it => {
                const flipped = getFlippedHitObject(it, 'vertical')
                this.ctx.sendMessage('updateHitObject', {hitObject: flipped})
            })
            evt.preventDefault()
        }

        if (evt.detail === 'ctrl+c') {
            this.copiedHitObjects = this.ctx.beatmap.hitobjects.selection.map(it => it.serialized())
            evt.preventDefault()
        }

        if (evt.detail === 'ctrl+v') {
            if (this.copiedHitObjects.length > 0) {
                const offset = this.ctx.currentTime - this.copiedHitObjects[0].startTime
                const hitObjects = this.copiedHitObjects.map(it => {
                    return {
                        ...it,
                        time: it.startTime + offset
                    }
                })

                hitObjects.forEach(it =>
                    this.ctx.sendMessage('createHitObject', {hitObject: it})
                )
            }
        }

        if (evt.detail === 'ctrl+i') {
            const sliders = this.tool.selection.filter(t => t instanceof Slider) as Slider[]
            sliders.forEach(slider => {
                this.tool.sendMessage('updateHitObject', {
                    hitObject: slider.serialized({
                        repeats: slider.repeatCount + 1
                    })
                })
            })
            evt.preventDefault()

        }

        if (evt.detail === 'ctrl+u') {
            const sliders = this.tool.selection.filter(t => t instanceof Slider) as Slider[]
            sliders.forEach(slider => {
                if (slider.repeatCount <= 1)
                    return;

                this.tool.sendMessage('updateHitObject', {
                    hitObject: slider.serialized({
                        repeats: slider.repeatCount - 1
                    })
                })
            })
            evt.preventDefault()
        }

        if (evt.detail === '1') {
            this.toolId = 'select'
            evt.preventDefault()
        }
        if (evt.detail === '2') {
            this.toolId = 'circle'
            evt.preventDefault()
        }
        if (evt.detail === '3') {
            this.toolId = 'slider'
            evt.preventDefault()
        }
    }

    copiedHitObjects: HitObjectData[] = []

    handleMouseMove(mousePos: Vec2) {
        this.mousePos = mousePos
        if (!this.isMouseDown) {
            if (this.tool.dragOperation)
                this.tool.dragOperation.onMouseMove?.(mousePos)
            this.tool.onMouseMove?.(mousePos)
        }
    }

    // region contextmenu

    contextMenuOptions = shallowRef<any>()
    contextMenuPos = Vec2.zero()
    contextMenuCallback: ((value: string) => void) | null = null

    showContextMenu(options: DropdownOption[], pos: Vec2, onSelect: (value: string) => void) {
        this.contextMenuOptions.value = options
        this.contextMenuPos = pos
        this.contextMenuCallback = onSelect
    }

    hideContextMenu() {
        this.contextMenuOptions.value = undefined
    }

    onContextMenuSelect(value: string) {
        if (value) {
            this.contextMenuCallback?.(value)
        }
        this.hideContextMenu()
    }

    // endregion

}